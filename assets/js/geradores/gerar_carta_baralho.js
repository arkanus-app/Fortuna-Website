document.getElementById("cardsrun").onclick=card;function card(){var a=document.getElementById("cardstype").value;"random"==a&&(a=Math.floor(4*Math.random())),card=Math.floor(13*Math.random())+1,cardimg=`https://apis.arkanus.app/poker-card/${a}/${card}.webp`,document.getElementById("cardshow").src=cardimg}