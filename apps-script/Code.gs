/**
 * Recebe os leads do site unibangalos.tribuzz.com.br, grava na planilha
 * "Leads - Unibangalos" (pasta Leads do Google Drive) e envia para o CV CRM.
 *
 * Publicar: Implantar > Nova implantação > Tipo "App da Web"
 *   - Executar como: Eu
 *   - Quem pode acessar: Qualquer pessoa
 *
 * CV CRM: em Configurações do projeto (engrenagem) > Propriedades do script, crie:
 *   CV_SUBDOMINIO        ex.: unibangalos  (de unibangalos.cvcrm.com.br)
 *   CV_EMAIL             email do usuário de integração no CV
 *   CV_TOKEN             token desse usuário
 *   CV_ORIGEM            (opcional) código de origem/mídia aceito pelo CV
 *   CV_IDEMPREENDIMENTO  (opcional) ID do empreendimento
 *   CV_ENDPOINT          (opcional) padrão: /api/v1/comercial/leads
 * Sem CV_SUBDOMINIO/CV_EMAIL/CV_TOKEN o envio ao CV fica desligado.
 */

var SPREADSHEET_ID = '1Lr3Y-7vigOVVwJllh20IivSSD5XKCE2L54bhHx5JX6s';

var CABECALHO = [
  'Data/Hora', 'Nome', 'Email', 'Telefone', 'Objetivo',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'Página', 'CV CRM'
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  var sheet, linha;

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(CABECALHO);
    } else if (sheet.getRange(1, CABECALHO.length).getValue() === '') {
      sheet.getRange(1, CABECALHO.length).setValue(CABECALHO[CABECALHO.length - 1]);
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss'),
      limpar(p.nome),
      limpar(p.email),
      limpar(p.telefone),
      limpar(p.objetivo),
      limpar(p.utm_source),
      limpar(p.utm_medium),
      limpar(p.utm_campaign),
      limpar(p.utm_content),
      limpar(p.utm_term),
      limpar(p.fbclid),
      limpar(p.pagina)
    ]);
    linha = sheet.getLastRow();
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }

  // O lead já está salvo na planilha; falha no CRM não perde o lead
  var cv = enviarParaCV(p);
  sheet.getRange(linha, CABECALHO.length).setValue(limpar(cv.status));

  return resposta({ ok: true });
}

// Permite testar a URL no navegador
function doGet() {
  return resposta({ ok: true, status: 'online' });
}

function enviarParaCV(p) {
  var props = PropertiesService.getScriptProperties().getProperties();
  if (!props.CV_SUBDOMINIO || !props.CV_EMAIL || !props.CV_TOKEN) {
    return { ok: false, status: 'CV não configurado' };
  }

  var url = 'https://' + props.CV_SUBDOMINIO + '.cvcrm.com.br' +
    (props.CV_ENDPOINT || '/api/v1/comercial/leads');

  var lead = {
    nome: String(p.nome || ''),
    email: String(p.email || ''),
    telefone: String(p.telefone || '').replace(/\D/g, ''),
    permitir_alteracao: true
  };
  if (props.CV_ORIGEM) lead.origem = props.CV_ORIGEM;
  if (props.CV_IDEMPREENDIMENTO) lead.idempreendimento = Number(props.CV_IDEMPREENDIMENTO);

  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { email: props.CV_EMAIL, token: props.CV_TOKEN },
      payload: JSON.stringify(lead),
      muteHttpExceptions: true
    });
    var codigo = res.getResponseCode();
    var corpo = res.getContentText().slice(0, 300);
    console.log('CV CRM ' + codigo + ': ' + corpo);
    return {
      ok: codigo >= 200 && codigo < 300,
      status: (codigo >= 200 && codigo < 300 ? 'OK ' : 'Erro ') + codigo + ' ' + corpo
    };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 'Erro ' + err };
  }
}

// Rode esta função pelo editor para testar o envio ao CV CRM (veja o resultado em "Registro de execução")
function testarCV() {
  var r = enviarParaCV({
    nome: 'Teste Integração Site',
    email: 'teste.integracao@unibangalos.com.br',
    telefone: '(85) 99999-0000'
  });
  console.log(JSON.stringify(r));
}

// Evita que valores sejam interpretados como fórmula na planilha
function limpar(v) {
  v = String(v || '').slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
