import {
  KubeConfig,
  CoreV1Api,
  AppsV1Api,
  CustomObjectsApi,
  makeInformer,
  ADD,
  ERROR,
} from "@kubernetes/client-node";

const DUMMYSITES_PATH = "/apis/stable.dwk/v1/dummysites";
const INFORMER_RESTART_DELAY_MS = 5000;

const kc = new KubeConfig();
process.env.KUBERNETES_SERVICE_HOST
  ? kc.loadFromCluster()
  : kc.loadFromDefault();

const core = kc.makeApiClient(CoreV1Api);
const apps = kc.makeApiClient(AppsV1Api);
const customObjects = kc.makeApiClient(CustomObjectsApi);

const fetchWebsiteHTML = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const html = await res.text();
  // replace relative URLs
  return html.replace(/<head([^>]*)>/i, `<head$1><base href="${url}">`);
};

const createIfNotExists = async (fn) => {
  try {
    await fn();
  } catch (err) {
    if (err.code !== 409) throw err;
  }
};

const ownerReference = (dsite) => ({
  apiVersion: dsite.apiVersion,
  kind: dsite.kind,
  name: dsite.metadata.name,
  uid: dsite.metadata.uid,
  controller: true,
});

const createConfigMap = ({ name, namespace, owner, html }) =>
  createIfNotExists(() =>
    core.createNamespacedConfigMap({
      namespace,
      body: {
        metadata: {
          name: `${name}-html`,
          namespace,
          ownerReferences: [owner],
        },
        data: { "index.html": html },
      },
    }),
  );

const createDeployment = ({ name, namespace, owner }) =>
  createIfNotExists(() =>
    apps.createNamespacedDeployment({
      namespace,
      body: {
        metadata: { name, namespace, ownerReferences: [owner] },
        spec: {
          replicas: 1,
          selector: { matchLabels: { app: `dummysite-${name}` } },
          template: {
            metadata: { labels: { app: `dummysite-${name}` } },
            spec: {
              containers: [
                {
                  name: "nginx",
                  image: "nginx:alpine",
                  ports: [{ containerPort: 80 }],
                  volumeMounts: [
                    { name: "html", mountPath: "/usr/share/nginx/html" },
                  ],
                },
              ],
              volumes: [
                {
                  name: "html",
                  configMap: { name: `${name}-html` },
                },
              ],
            },
          },
        },
      },
    }),
  );

const createService = ({ name, namespace, owner }) =>
  createIfNotExists(() =>
    core.createNamespacedService({
      namespace,
      body: {
        metadata: { name, namespace, ownerReferences: [owner] },
        spec: {
          selector: { app: `dummysite-${name}` },
          ports: [{ port: 80, targetPort: 80 }],
        },
      },
    }),
  );

const createDummySiteResources = async (dsite) => {
  const { name, namespace } = dsite.metadata;
  const owner = ownerReference(dsite);
  const html = await fetchWebsiteHTML(dsite.spec.website_url);

  await createConfigMap({ name, namespace, owner, html });
  await createDeployment({ name, namespace, owner });
  await createService({ name, namespace, owner });

  console.log(
    `created resources for DummySite ${name} in namespace ${namespace}`,
  );
};

const listDummySites = () =>
  customObjects.listClusterCustomObject({
    group: "stable.dwk",
    version: "v1",
    plural: "dummysites",
  });

const informer = makeInformer(kc, DUMMYSITES_PATH, listDummySites);

informer.on(ADD, (dsite) => {
  createDummySiteResources(dsite).catch((err) =>
    console.error(`failed DummySite ${dsite.metadata.name}:`, err),
  );
});

informer.on(ERROR, (err) => {
  console.error("informer error:", err);
  setTimeout(() => informer.start(), INFORMER_RESTART_DELAY_MS);
});

console.log(`watching ${DUMMYSITES_PATH}`);
informer.start();
