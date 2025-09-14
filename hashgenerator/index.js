const generateRandomString = () => {
    const strings = []
    const randomString = crypto.randomUUID()
    strings.push(randomString)

    const timeStamp = new Date().toISOString()

    console.log(timeStamp + ':', randomString)

    setTimeout(generateRandomString, 5000)
}

generateRandomString()