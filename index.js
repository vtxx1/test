const { twitterClient } = require("./twitterClient.js")
const { registerFont, createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const moment = require("moment/moment.js");

const getData = require("./getData.js");
const urlManager = new getData();

var textIpca = 0;
var textPtax = 0;
var textSelic = 0;
var textDate = moment().format("DD/MM/YYYY");

urlManager.fetchData("https://conteudo.bcb.gov.br/api/feed/pt-br/PAINEL_INDICADORES/cambio")
    .then(response => {
        valorPtax = "" + response;
        let valorPtaxFixed = valorPtax.split('<content type="html">&lt;div id=rate&gt;&lt;div id=label&gt;Compra&lt;/div&gt;&lt;div id=value&gt;')
        textPtax = "R$ " + valorPtaxFixed[1].substring(0, valorPtaxFixed[1].indexOf("&lt;/div"));
        console.log("# Loaded PTAX - " + textPtax);
    }).catch(error => {
        console.error('Erro:', error.message);
        textPtax = '0';
    });

urlManager.fetchData("https://conteudo.bcb.gov.br/api/feed/pt-br/PAINEL_INDICADORES/juros")
    .then(response => {
        valorSelic = "" + response;
        let valorSelicFixed = valorSelic.split('<content type="html">&lt;div id=label&gt;Meta:&lt;/div&gt;&lt;div id=rate&gt;&lt;div id=ratevalue&gt;')
        textSelic = valorSelicFixed[1].substring(0, valorSelicFixed[1].indexOf("&lt;/div"));
        console.log("# Loaded SELIC - " + textSelic);
    }).catch(error => {
        console.error('Erro:', error.message);
        textSelic = '0';
    });

urlManager.fetchData("https://www.ibge.gov.br/explica/inflacao.php")
    .then(response => {
        valorIpca = "" + response;
        let valorIpcaFixed = valorIpca.split("<p class=\"variavel-dado\">")
        textIpca = valorIpcaFixed[1].substring(0, valorIpcaFixed[1].indexOf("</p>"));
        console.log("# Loaded IPCA - " + textIpca)
    }).catch(error => {
        console.error('Erro: ', error.message);
        textIpca = '0';
    });


const canvas = createCanvas(1500, 500);
const ctx = canvas.getContext('2d');

registerFont('./assets/Unbounded.ttf', { family: 'Unbounded' });
ctx.font = '40px Unbounded';

async function start() {

    console.log("# [" + moment().format("DD/MM/YYYY - HH:mm.ss") + "] Iniciando processo de atualização do banner...");
    await new Promise(resolve => setTimeout(resolve, 3500));

    loadImage("./assets/banner_base.png").then((image) => {
        ctx.drawImage(image, 0, 0, 1500, 500);

        ctx.fillStyle = 'rgb(255, 255, 255)';

        if (textIpca === '0') textIpca = '\'erro\'';
        if (textSelic === '0') textSelic = '\'erro\'';
        if (textPtax === '0') textPtax = '\'erro\'';

        ctx.fillText(textIpca, 625, 120);
        ctx.fillText(textPtax, 640, 223);
        ctx.fillText(textSelic, 620, 330);

        ctx.fillText(textDate, (750 - ctx.measureText(textDate).width) +
            ctx.measureText(textDate).width / 2, 420);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('./assets/banner_pronto.png', buffer);
    })

    const changeBanner = async () => {
        try {

            twitterClient.v1.updateAccountProfileBanner("./assets/banner_pronto.png").then(() => {
                console.log("# [" + moment().format("DD/MM/YYYY - HH:mm.ss") + "] O banner foi atualizado com sucesso!")
            })
        } catch (exception) {
            console.log("# [" + moment().format("DD/MM/YYYY - HH:mm.ss") + "] Houve um erro ao alterar o banner: " + exception)
        }
    }

    changeBanner();

}
setInterval(() => start(), 1000 * 60 * 60 * 24);
