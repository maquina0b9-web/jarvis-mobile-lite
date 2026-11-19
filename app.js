const replyEl=document.getElementById('reply');
const statusEl=document.getElementById('status');
const micBtn=document.getElementById('micBtn');
const listenBtn=document.getElementById('listenBtn');
const form=document.getElementById('chatForm');
const input=document.getElementById('message');
let recognition=null, listening=false, wakeMode=false;

function speak(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='pt-PT'; u.rate=0.96; u.pitch=0.9;
  window.speechSynthesis.speak(u);
}
function say(text, voice=false){
  replyEl.textContent=text;
  localStorage.setItem('jarvis_last_reply',text);
  if(voice) speak(text);
}
function command(raw, voice=false){
  const t=raw.trim().toLowerCase();
  if(!t) return;
  const history=JSON.parse(localStorage.getItem('jarvis_history')||'[]');
  history.push({user:raw,at:Date.now()});
  localStorage.setItem('jarvis_history',JSON.stringify(history.slice(-30)));
  let answer='';
  if(t.includes('jarvis')) {
    answer='Estou aqui. Diz-me o que precisas.';
  } else if(t.includes('hora')) {
    answer='Agora são '+new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})+'.';
  } else if(t.includes('data') || t.includes('dia de hoje')) {
    answer='Hoje é '+new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'.';
  } else if(t.includes('youtube')) {
    answer='A abrir o YouTube.';
    window.open('https://m.youtube.com','_blank','noopener');
  } else if(t.includes('whatsapp')) {
    answer='A tentar abrir o WhatsApp.';
    window.location.href='https://wa.me/';
  } else if(t.includes('ajuda')) {
    answer='Posso dizer as horas, a data e abrir o YouTube ou WhatsApp. A inteligência artificial online será adicionada numa próxima versão.';
  } else if(t.includes('limpa') || t.includes('apaga conversa')) {
    localStorage.removeItem('jarvis_history');
    answer='Histórico local limpo.';
  } else {
    answer='Ainda não tenho inteligência artificial ligada. Por enquanto consigo executar os comandos básicos. Na próxima etapa vamos ligar um serviço de IA com segurança.';
  }
  say(answer,voice);
}
function setupSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){say('O reconhecimento de voz não está disponível neste navegador. Experimenta atualizar o Chrome ou usa o campo de texto.');return false;}
  recognition=new SR();
  recognition.lang='pt-PT'; recognition.continuous=false; recognition.interimResults=false;
  recognition.onstart=()=>{listening=true;micBtn.classList.add('listening');statusEl.textContent='A OUVIR';};
  recognition.onend=()=>{listening=false;micBtn.classList.remove('listening');statusEl.textContent='PRONTO';};
  recognition.onerror=(e)=>{say('Não consegui ouvir. Confirma a permissão do microfone e tenta novamente.');};
  recognition.onresult=(e)=>{
    const heard=e.results[0][0].transcript;
    input.value=heard;
    const cleaned=heard.replace(/^\s*jarvis[,.!]?\s*/i,'').trim();
    if(!cleaned){say('Estou aqui. Como posso ajudar?',true);return;}
    command(cleaned,true);
  };
  return true;
}
function startListening(){
  if(!recognition && !setupSpeech()) return;
  try{recognition.start();}catch(e){say('O microfone já está ativo.');}
}
micBtn.addEventListener('click',startListening);
listenBtn.addEventListener('click',()=>{
  wakeMode=!wakeMode;
  listenBtn.textContent=wakeMode?'ESCUTA ATIVA (COM A APP ABERTA)':'ATIVAR ESCUTA';
  say(wakeMode?'Escuta ativada. Toca no botão do microfone e diz Jarvis seguido do comando. Não fico a ouvir em segundo plano.':'Escuta desativada.');
});
form.addEventListener('submit',e=>{e.preventDefault();const v=input.value;command(v,false);input.value='';});
document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>command(b.dataset.command,true)));
document.getElementById('clearBtn').addEventListener('click',()=>{localStorage.removeItem('jarvis_history');say('Conversa local limpa.');});
const saved=localStorage.getItem('jarvis_last_reply'); if(saved) replyEl.textContent=saved;
