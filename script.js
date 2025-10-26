// ここにJavaScriptのコードを追加します。
// 例: スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submit-button');

    function setFeedback(text, type) {
        if (!feedback) return;
        feedback.textContent = text;
        feedback.className = 'form-feedback' + (type ? ' ' + type : '');
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 必須: ご相談内容（content[]）が1つ以上チェックされているか
        const contents = form.querySelectorAll('input[name="content[]"]');
        const anyContentChecked = Array.from(contents).some(c => c.checked);
        if (!anyContentChecked) {
            setFeedback('ご相談内容を1つ以上選択してください。', 'error');
            return;
        }

        // 簡易フォーマットチェック（郵便番号・電話）
        const zip = form.querySelector('input[name="zip_code"]')?.value.trim() || '';
        const phone = form.querySelector('input[name="phone"]')?.value.trim() || '';
        const zipOk = zip === '' || /^\d{3}-\d{4}$/.test(zip) || /^\d{7}$/.test(zip);
        const phoneOk = phone === '' || /^[0-9\-\+\(\) ]{7,20}$/.test(phone);

        if (!zipOk) {
            setFeedback('郵便番号は「123-4567」または「1234567」の形式で入力してください。', 'error');
            return;
        }
        if (!phoneOk) {
            setFeedback('電話番号の形式が正しくないようです。', 'error');
            return;
        }

        // disable submit
        submitBtn.disabled = true;
        setFeedback('送信中...', '');

        try {
            const action = form.getAttribute('action') || '';
            const formData = new FormData(form);

            // デモ用: action がプレースホルダのままなら送信せず完了メッセージ
            if (!action || action === '送信先のURL') {
                // 擬似送信遅延
                await new Promise(r => setTimeout(r, 800));
                form.reset();
                setFeedback('デモ送信が完了しました（送信先のURLを設定してください）。', 'success');
                return;
            }

            // 実送信
            const res = await fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                form.reset();
                setFeedback('送信が完了しました。ありがとうございました。', 'success');
            } else {
                // 可能ならサーバーメッセージを表示
                let data;
                try { data = await res.json(); } catch { data = null; }
                setFeedback((data && (data.error || data.message)) || '送信に失敗しました。時間をおいて再度お試しください。', 'error');
            }
        } catch (err) {
            console.error(err);
            setFeedback('送信時にエラーが発生しました。', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });
});
