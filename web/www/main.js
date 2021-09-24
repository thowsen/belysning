const buttonContainer = document.getElementById('content')

const generateBox = (buttonName, image, setting) => {
    let d = document.createElement('div')
    let i = document.createElement('img')
    let p = document.createElement('p')
    i.src = image
    p.innerHTML = buttonName
    d.appendChild(i)
    d.appendChild(p)

    d.classList.add('lightbox')

    d.addEventListener('click', () => {
        let josn = JSON.stringify({
            option: setting
        })
        fetch('/lampapi', {
                method: 'POST',
                body: josn,
                headers: {
                    'content-type': 'application/json'
                },
            }).then(res => console.log('Sent settings request! (' + res + ')'))
            .catch(e => console.log('Error sending request! (' + e + ')'))
    })

    buttonContainer.appendChild(d)
}

generateBox('Halloween', 'https://dummyimage.com/256x192/000/bbb', 'halloween')
generateBox('Christmas', 'https://dummyimage.com/256x192/000/bbb', 'christmas')
generateBox('White', 'https://dummyimage.com/256x192/000/bbb', 'white')
generateBox('Custom', 'https://dummyimage.com/256x192/000/bbb', 'joe')