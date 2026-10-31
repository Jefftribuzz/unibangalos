/**
 * Recebe os leads do site unibangalos.tribuzz.com.br e grava na planilha
 * "Leads - Unibangalos" (pasta Leads do Google Drive).
 *
 * Publicar: Implantar > Nova implantação > Tipo "App da Web"
 *   - Executar como: Eu
 *   - Quem pode acessar: Qualquer pessoa
 */

var SPREADSHEET_ID = '1Lr3Y-7vigOVVwJllh20IivSSD5XKCE2L54bhHx5JX6s';

var CABECALHO = [
  'Data/Hora', 'Nome', 'Email', 'Telefone', 'Objetivo',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'Página'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var p = (e && e.parameter) || {};
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(CABECALHO);
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

    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Permite testar a URL no navegador
function doGet() {
  return resposta({ ok: true, status: 'online' });
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
