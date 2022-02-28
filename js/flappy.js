// Função para criar um novo elemento/TAG no arquivo HTML
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}


// Criando um método construtor para criar uma barreira...  
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')
    
    // Primeiro criando os dois elementos da barreira: Borda e corpo;
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    // Usando o método appendChild para adicionar as duas barreiras;
    this.elemento.appendChild(reversa ? corpo : borda) 
    // Se for reversa: Adiciono primeiro o corpo, depois, a borda da barreira;
    this.elemento.appendChild(reversa ? borda : corpo) // Se não for, será aplicado o contrário.
    
    // Criando mátodo construtor para facilmente alterar a altura da barreira...
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// Abaixo, linhas para testar a construção da barreira...
// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
    
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth
    
    this.sortearAbertura()
    this.setX(x)
}

// Abaixo, linhas para testar o par de barreiras... 
// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3) 
    ]
    
    const deslocamento = 3
    // Função rsponsável por fazer a animação/movimento das barreiras...
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)
            
            // Quando o elemento sair do área do jogo.
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
            && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
            
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false
    
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'
    
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`
    
    window.onkeydown = e => voando = true // Quando qualquer tecla estiver pressionada, estará voando;
    window.onkeyup = e => voando = false // Tecla solta, passaro caindo;
    
    //Crindo a função animar para a movimentação do pássaro...
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        
        // Controlando a altura máxima e mínima de voo do pássaro...
        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect() // Armazenar em "a" todo o retângulo do elementoA
    const b = elementoB.getBoundingClientRect()
    
    // Quando o lado esquerdo de A + sua largura (lado direito de A) for >= ao lado esquerdo de B 
    const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
            || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu 
}

function FlappyBird() {
    let pontos = 0
    
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight // Calculando a altura do jogo e armazenando em "altura"
    const largura = areaDoJogo.clientWidth // Calculando a largura do jogo e armazenando em "largura"
    
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 180, 400,
        () => progresso.atualizarPontos(++pontos))
        const passaro = new Passaro(altura)
        
        // Depois de criados os elementos, agora incluiremos eles na tela do jogo.
        areaDoJogo.appendChild(progresso.elemento)
        areaDoJogo.appendChild(passaro.elemento)
        barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
        
        this.start = () => {
            // Loop do jogo...
            const temporizador = setInterval(() => {
                barreiras.animar()
                passaro.animar()
                
                if (colidiu(passaro, barreiras)) {
                    clearInterval(temporizador)

                    const gameOver = novoElemento('div', 'game-over')
                    const h2 = novoElemento('h2', 'mensagem')
                    h2.innerHTML = 'GAME OVER !'
                    gameOver.appendChild(h2)
                    
                    const botao = novoElemento('button', 'botao-restart')
                    botao.setAttribute('onClick', 'window.location.reload()')
                    botao.innerHTML = 'Restart Game'
                    
                    gameOver.appendChild(botao)

                    areaDoJogo.appendChild(gameOver)
                }
            }, 20)
        }
    }
    
    

new FlappyBird().start()
    
// const barreiras = new Barreiras(500, 1200, 200, 400)
// const passaro = new Passaro(500)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
    //     barreiras.animar()
    //     passaro.animar()
    // }, 20)
        