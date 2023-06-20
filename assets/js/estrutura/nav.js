//atualize os links href dos itens com id lang_en e lang_pt para a respetiva pagina no respectivo idioma
// o site em inglês usa a seguitne formatação dominio/pagina.html
// o site em português usa a seguitne formatação dominio/pt/pagina.html

$(function() {
  var lang = window.location.pathname.split('/')[1];
  var caminho = window.location.pathname.split('/').slice(2).join('/');

  var paginaEn = '/' + (caminho ? caminho : '');
  var paginaPt = '/pt' + (caminho ? '/' + caminho : '');

  $('#lang_en').attr('href', paginaEn);
  $('#lang_pt').attr('href', paginaPt);
  $('#lang_pt-1').attr('href', paginaPt);
  $('#lang_pt-1').attr('href', paginaPt);
});


var lang = window.location.pathname.split('/')[1];
//caso lang seja vazio, significa que é ingles
if (lang == '') {
  lang = 'en';
}

var userLang = navigator.language || navigator.userLanguage; 
userLang = userLang.split('-')[0];
console.log(userLang);
console.log(lang);
if (userLang != lang) {

  if (userLang == 'pt') {
    console.log('idioma diferente | ideal: pt');
    //modifique o texto do elemento com id alert_idioma_title
    document.getElementById('alert_idioma_title').innerHTML = 'Conteúdo disponível em seu idioma ';
    document.getElementById('alert_idioma_text').innerHTML = 'Todo o conteúdo dessa página também está disponível em Português.';
    document.getElementById('alert_idioma_button').innerHTML = 'Acessar em Português';
    //modifique o href do botão
    document.getElementById('alert_idioma_button').href = `/pt${window.location.pathname}`;

    var myAlert = document.getElementById('alert_idioma');//select id of toast
    var bsAlert = new bootstrap.Toast(myAlert);//inizialize it
    bsAlert.show();//show it
  }

}
