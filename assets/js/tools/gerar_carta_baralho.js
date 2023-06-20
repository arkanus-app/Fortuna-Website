//quando o botão cardsrun for apertado chame card
document.getElementById("cardsrun").onclick = card;

function card(){
    var cardtype = document.getElementById("cardstype").value;
        if (cardtype == "random") {
            cardtype = Math.floor(Math.random() * 4);
        } 
        card = Math.floor(Math.random() * 13) + 1;
        cardimg = `https://apis.arkanus.app/poker-card/${cardtype}/${card}.webp`
        //substitua a imagem de id cardshow por cardimg
        document.getElementById("cardshow").src = cardimg;
        console.log(`Carta gerada com sucesso:\n${cardimg}\nTipo: ${cardtype}\nValor: ${card}`)
}

//https://apis.arkanus.app/poker-card/0/1.webp