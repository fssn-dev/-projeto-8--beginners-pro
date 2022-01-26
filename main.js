"use strict"

const PESQUISA = document.getElementById("botaoBuscar")
const CARD = document.getElementById("card")
const INPUT = document.getElementById("argumento")

//variável que recebe os dados da api
let lista = null

INPUT.focus()

//habilita a pesquisa com a tecla enter
INPUT.addEventListener("keypress", (keypress) => {
    if (keypress.key === "Enter") {
        PESQUISA.click()
    }
})

//instruções do botao de pesquisa
PESQUISA.addEventListener('click', () => {
    //limpa o innerHTML da tabela
    CARD.innerHTML = ''

    //chama a api e a consome criando a tabela
    buscaApiECriaTabela()

    //para o áudio em execução
    stopConcurrentAudio()
})

function criaTabela() {

    //se a palavra pesquisada não trouxer resultado a variável lista se torna um vetor vazio
    if (lista.length == 0) {

        alert("Resultado não encontrado.")
        INPUT.value = ""
        INPUT.focus()
        return
    }

    //incrementa o innerHTML da div que conterá a tabela com o cabeçalho da tabela
    CARD.innerHTML += TemplateHead()
    //gera os dados da tabela
    TableBody(lista)
}

function buscaApiECriaTabela() {
    try {
        fetch(`https://deezerdevs-deezer.p.rapidapi.com/search?q=${INPUT.value}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
                "x-rapidapi-key": "INSERT KEY HERE"
            }
        })
            .then(response =>
                response.json()
            )
            .then(api => {
                if (api.hasOwnProperty('data')) {
                    lista = api.data
                    criaTabela()

                    //em caso de falha na api o objeto possui a propriedade error ao invés de data
                } else {
                    alert("Campo de pesquisa em branco.")
                    INPUT.value = ""
                    INPUT.focus()
                }
            })
    } catch {
        e =>
            console.log(e)
    }
}

function TemplateHead() {
    return `
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Música</th>
                            <th></th>
                            <th>Artista</th>
                            <th></th>
                            <th>Album</th>
                            <th>Duração</th>
                            <th>Ranking</th>
                     </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            `
}

function TableBody(object) {
    let counter = 0
    object.forEach(element => {
        counter++
        document.querySelector('tbody').innerHTML += `
                <tr>
                    <td class="buttonHolder"><button class="playButton" id="playButton${counter - 1}" onclick="stopConcurrentAudioAndPlay(${counter - 1})"><img src="./images/play.png"><button class="stopButton" id="stopButton${counter - 1}" style="display: none;" onclick="stopConcurrentAudio()"><img src="./images/stop.png"></button></button></td>
                    <td class="nomeMusica">${element.title}</td>
                    <td class="fotoArtista"><img src="${element.artist.picture_small}"></td>
                    <td class="nomeArtista">${element.artist.name}</td>
                    <td class="fotoAlbum"><img src="${element.album.cover_small}"></td>
                    <td class="nomeAlbum">${element.album.title}</td>
                    <td class="duracao">${convertSecondsToMinutes(element.duration)}</td>
                    <td class="ranking">${element.rank}</td>
                </tr>
                    `
    })
}

//converte o valor recebido da api em minutos e segundos
function convertSecondsToMinutes(duration) {

    let minutes = Math.floor(duration / 60)
    let seconds = duration - minutes * 60

    return `${('0' + minutes).slice(- 2)}:${('0' + seconds).slice(-2)}`
}

//para os áudios correntes e inicia a reprodução do áudio do botão play clicado
//apenas um áudio existe por vez na aplicação
function stopConcurrentAudioAndPlay(index) {

    //callback
    stopConcurrentAudio()

    //seleciona os botões a serem manipulados
    let playButton = document.getElementById(`playButton${index}`)
    let stopButton = document.getElementById(`stopButton${index}`)

    //troca o botão de play pelo botão de stop
    playButton.style.display = 'none'
    stopButton.style.display = 'initial'

    //cria o elemento áudio com id da posição do botão play clicado
    let audio
    audio = document.createElement('audio')
    audio.src = lista[index].preview
    audio.id = `audio${index}`

    //insere o áudio criado na main para manipulação
    let main = document.querySelector('main')
    main.appendChild(audio)

    //reproduz o áudio
    document.getElementById(`audio${index}`).play()

}


function stopConcurrentAudio() {

    //seleciona todos os áudios da aplicação
    let audio = document.querySelectorAll('audio')

    //tratativa caso não exista áudio no momento
    if (!!audio && audio.length != 0) {

        //remove todos os elementos de áudio
        audio.forEach(audio => audio.remove())

        //variável com todos os nós do botão stop
        let nodeStop = document.getElementsByClassName('stopButton')
        //converte para vetor
        let stopButtonArray = [...nodeStop]
        //esconde todos os botões stop ativos
        stopButtonArray.forEach(element => element.style.display = 'none')

        let nodePlay = document.getElementsByClassName('playButton')
        let playButtonArray = [...nodePlay]
        //restaura todos os botões play inativos
        playButtonArray.forEach(element => element.style.display = 'initial')
    }
}