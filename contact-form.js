// 軽いクライアント検証と送信ハンドリング（action を実運用のエンドポイントに変更してください）
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-button');

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    status.textContent = '';
    // required チェック
    const required = form.querySelectorAll('[required]');
    for(const el of required){
      if(!el.value.trim()){
        el.focus();
        status.textContent = '必須項目をすべて入力してください。';
        return;
      }
    }

    const formData = new FormData(form);
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    const action = form.getAttribute('action') || '/contact';
    try{
      const resp = await fetch(action, {
        method: (form.method || 'POST').toUpperCase(),
        body: formData,
        credentials: 'same-origin'
      });

      if(resp.ok){
        status.textContent = '送信が完了しました。ありがとうございます。';
        form.reset();
      } else {
        const text = await resp.text().catch(()=>resp.statusText);
        console.error('Contact error', resp.status, text);
        status.textContent = '送信中に問題が発生しました。もう一度お試しください。';
      }
    } catch(err){
      console.warn('fetch error, demo fallback:', err);
      status.textContent = '（デモ）送信が完了しました。実運用時は form の action をサーバーに設定してください。';
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  });
})();