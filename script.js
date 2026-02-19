/* ========================
   АНИМИРОВАННЫЕ СЧЁТЧИКИ
   ======================== */
function animateCounter(el, target, duration = 1200) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    }, 16);
}

// Запускаем счётчики при загрузке страницы
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.mini-num').forEach(el => {
            animateCounter(el, parseInt(el.dataset.target));
        });
    }, 800);
});


/* ========================
   ГЕЙМПАД
   ======================== */
(function () {
    const cv = document.getElementById('characterCanvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    const W = 380, H = 440;
    let t = 0;

    // ── Кнопки: 0=A 1=B 2=X 3=Y 4=LB 5=RB 6=dU 7=dR 8=dD 9=dL ──
    const pressed = new Array(10).fill(false);
    const pressTimer = new Array(10).fill(0);

    function randomPress() {
        const i = Math.floor(Math.random() * pressed.length);
        if (!pressed[i]) {
            pressed[i] = true;
            pressTimer[i] = 14 + Math.floor(Math.random() * 16);
        }
        setTimeout(randomPress, 250 + Math.random() * 700);
    }
    randomPress();

    // Вибро
    let shake = { x: 0, y: 0, life: 0 };
    function doShake() { shake = { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 3, life: 6 }; }

    // Частицы
    const parts = [];
    function burst(x, y, col) {
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + Math.random() * .4;
            const spd = 1.5 + Math.random() * 2.5;
            parts.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, r: 2.5 + Math.random() * 2, col });
        }
    }

    const FACE = {
        A: { col: '#1db954', glow: '#4dff8a' },
        B: { col: '#e03030', glow: '#ff6060' },
        X: { col: '#1a7fe0', glow: '#55aaff' },
        Y: { col: '#e0a000', glow: '#ffd040' },
    };

    // ── Утилиты ───────────────────────────────────────────────
    function circ(x, y, r, fill, stroke, lw = 1.5) {
        cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2);
        if (fill) { cx.fillStyle = fill; cx.fill(); }
        if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.stroke(); }
    }

    function pill(x, y, w, h, r, fill, stroke, lw = 1.5) {
        cx.beginPath(); cx.roundRect(x, y, w, h, r);
        if (fill) { cx.fillStyle = fill; cx.fill(); }
        if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.stroke(); }
    }

    // ── Шейдеры пластика ──────────────────────────────────────
    function plasticGrad(x, y, w, h, light, dark) {
        const g = cx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, light); g.addColorStop(0.45, light);
        g.addColorStop(1, dark); return g;
    }

    // ── Корпус геймпада ───────────────────────────────────────
    // Основан на реальных пропорциях Xbox Series X
    function drawBody(ox, oy) {
        // Размеры
        const W2 = 240, H2 = 100;

        // — Рукоятки (рисуем первыми, они "под" телом) —
        // Левая рукоятка
        cx.save();
        cx.beginPath();
        cx.moveTo(ox - 95, oy + 40);
        cx.bezierCurveTo(ox - 120, oy + 50, ox - 115, oy + 130, ox - 80, oy + 148);
        cx.bezierCurveTo(ox - 55, oy + 162, ox - 30, oy + 148, ox - 25, oy + 115);
        cx.bezierCurveTo(ox - 20, oy + 90, ox - 30, oy + 55, ox - 50, oy + 42);
        cx.closePath();
        cx.fillStyle = plasticGrad(ox - 110, oy + 40, 80, 120, '#2c2c32', '#141418');
        cx.fill();
        cx.strokeStyle = '#3a3a44'; cx.lineWidth = 1.5; cx.stroke();
        cx.restore();

        // Правая рукоятка
        cx.save();
        cx.beginPath();
        cx.moveTo(ox + 95, oy + 40);
        cx.bezierCurveTo(ox + 120, oy + 50, ox + 115, oy + 130, ox + 80, oy + 148);
        cx.bezierCurveTo(ox + 55, oy + 162, ox + 30, oy + 148, ox + 25, oy + 115);
        cx.bezierCurveTo(ox + 20, oy + 90, ox + 30, oy + 55, ox + 50, oy + 42);
        cx.closePath();
        cx.fillStyle = plasticGrad(ox + 30, oy + 40, 80, 120, '#2c2c32', '#141418');
        cx.fill();
        cx.strokeStyle = '#3a3a44'; cx.lineWidth = 1.5; cx.stroke();
        cx.restore();

        // — Основное тело —
        cx.save();
        cx.beginPath();
        // Верхний изогнутый край
        cx.moveTo(ox - W2 / 2 + 30, oy - H2 / 2);
        cx.bezierCurveTo(ox - W2 / 2 + 10, oy - H2 / 2 - 10, ox - W2 / 2, oy - H2 / 2 + 5, ox - W2 / 2, oy);
        cx.bezierCurveTo(ox - W2 / 2, oy + H2 / 2 - 10, ox - W2 / 2 + 20, oy + H2 / 2, ox - W2 / 2 + 50, oy + H2 / 2 + 8);
        cx.bezierCurveTo(ox - 30, oy + H2 / 2 + 18, ox + 30, oy + H2 / 2 + 18, ox + W2 / 2 - 50, oy + H2 / 2 + 8);
        cx.bezierCurveTo(ox + W2 / 2 - 20, oy + H2 / 2, ox + W2 / 2, oy + H2 / 2 - 10, ox + W2 / 2, oy);
        cx.bezierCurveTo(ox + W2 / 2, oy - H2 / 2 + 5, ox + W2 / 2 - 10, oy - H2 / 2 - 10, ox + W2 / 2 - 30, oy - H2 / 2);
        cx.bezierCurveTo(ox + 20, oy - H2 / 2 - 8, ox - 20, oy - H2 / 2 - 8, ox - W2 / 2 + 30, oy - H2 / 2);
        cx.closePath();

        cx.fillStyle = plasticGrad(ox - W2 / 2, oy - H2 / 2, W2, H2 + 18, '#28282e', '#111116');
        cx.fill();
        cx.strokeStyle = '#383840'; cx.lineWidth = 1.5; cx.stroke();
        cx.restore();

        // Блик верхней поверхности
        cx.save();
        cx.beginPath();
        cx.moveTo(ox - W2 / 2 + 35, oy - H2 / 2 + 2);
        cx.bezierCurveTo(ox - 20, oy - H2 / 2 - 4, ox + 20, oy - H2 / 2 - 4, ox + W2 / 2 - 35, oy - H2 / 2 + 2);
        cx.bezierCurveTo(ox + W2 / 2 - 40, oy - H2 / 2 + 22, ox - W2 / 2 + 40, oy - H2 / 2 + 22, ox - W2 / 2 + 35, oy - H2 / 2 + 2);
        cx.closePath();
        const shine = cx.createLinearGradient(ox, oy - H2 / 2, ox, oy - H2 / 2 + 22);
        shine.addColorStop(0, 'rgba(255,255,255,0.07)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        cx.fillStyle = shine; cx.fill();
        cx.restore();

        // Центральная вставка (матовая)
        pill(ox - 50, oy - 30, 100, 60, 10, '#1a1a20', '#252530', 1);

        // LED полоска
        const led = cx.createLinearGradient(ox - 45, 0, ox + 45, 0);
        led.addColorStop(0, 'rgba(0,180,255,0)');
        led.addColorStop(0.3, 'rgba(0,200,255,0.7)');
        led.addColorStop(0.7, 'rgba(0,200,255,0.7)');
        led.addColorStop(1, 'rgba(0,180,255,0)');
        cx.fillStyle = led;
        cx.fillRect(ox - 45, oy - 32, 90, 2);

        // Индикаторы (4 точки)
        const pulse = 0.5 + Math.sin(t * 0.07) * 0.5;
        [ox - 18, ox - 6, ox + 6, ox + 18].forEach((lx, i) => {
            if (i < 2) {
                cx.globalAlpha = pulse;
                circ(lx, oy - 24, 2.5, '#00c8ff');
                cx.globalAlpha = pulse * 0.25;
                circ(lx, oy - 24, 5, '#00c8ff');
                cx.globalAlpha = 1;
            } else {
                circ(lx, oy - 24, 2.5, '#222228');
            }
        });
    }

    // ── Бамперы LB/RB ─────────────────────────────────────────
    function drawBumpers(ox, oy, lbP, rbP) {
        // LB
        cx.save();
        cx.beginPath();
        cx.moveTo(ox - 120, oy - 52);
        cx.bezierCurveTo(ox - 118, oy - 68, ox - 90, oy - 72, ox - 60, oy - 68);
        cx.bezierCurveTo(ox - 40, oy - 65, ox - 35, oy - 58, ox - 40, oy - 52);
        cx.closePath();
        cx.fillStyle = lbP ? '#404050' : '#22222a';
        cx.fill();
        cx.strokeStyle = lbP ? '#606070' : '#32323e'; cx.lineWidth = 1.5; cx.stroke();
        if (lbP) {
            cx.globalAlpha = 0.3;
            cx.fillStyle = '#ffffff'; cx.fill();
            cx.globalAlpha = 1;
        }
        cx.fillStyle = '#666'; cx.font = 'bold 8px Orbitron,sans-serif';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('LB', ox - 78, oy - 60);
        cx.restore();

        // RB
        cx.save();
        cx.beginPath();
        cx.moveTo(ox + 120, oy - 52);
        cx.bezierCurveTo(ox + 118, oy - 68, ox + 90, oy - 72, ox + 60, oy - 68);
        cx.bezierCurveTo(ox + 40, oy - 65, ox + 35, oy - 58, ox + 40, oy - 52);
        cx.closePath();
        cx.fillStyle = rbP ? '#404050' : '#22222a';
        cx.fill();
        cx.strokeStyle = rbP ? '#606070' : '#32323e'; cx.lineWidth = 1.5; cx.stroke();
        if (rbP) {
            cx.globalAlpha = 0.3;
            cx.fillStyle = '#ffffff'; cx.fill();
            cx.globalAlpha = 1;
        }
        cx.fillStyle = '#666'; cx.font = 'bold 8px Orbitron,sans-serif';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('RB', ox + 78, oy - 60);
        cx.restore();
    }

    // ── Триггеры LT/RT ────────────────────────────────────────
    function drawTriggers(ox, oy) {
        // LT
        cx.save();
        cx.beginPath();
        cx.moveTo(ox - 118, oy - 68);
        cx.bezierCurveTo(ox - 116, oy - 85, ox - 95, oy - 92, ox - 72, oy - 88);
        cx.bezierCurveTo(ox - 52, oy - 84, ox - 48, oy - 74, ox - 52, oy - 68);
        cx.closePath();
        cx.fillStyle = '#1c1c22'; cx.fill();
        cx.strokeStyle = '#2e2e38'; cx.lineWidth = 1.5; cx.stroke();
        cx.fillStyle = '#444'; cx.font = 'bold 7px Orbitron,sans-serif';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('LT', ox - 80, oy - 80);
        cx.restore();

        // RT
        cx.save();
        cx.beginPath();
        cx.moveTo(ox + 118, oy - 68);
        cx.bezierCurveTo(ox + 116, oy - 85, ox + 95, oy - 92, ox + 72, oy - 88);
        cx.bezierCurveTo(ox + 52, oy - 84, ox + 48, oy - 74, ox + 52, oy - 68);
        cx.closePath();
        cx.fillStyle = '#1c1c22'; cx.fill();
        cx.strokeStyle = '#2e2e38'; cx.lineWidth = 1.5; cx.stroke();
        cx.fillStyle = '#444'; cx.font = 'bold 7px Orbitron,sans-serif';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('RT', ox + 80, oy - 80);
        cx.restore();
    }

    // ── Аналоговый стик ───────────────────────────────────────
    function drawStick(sx, sy, tx, ty) {
        // Углубление
        const holeG = cx.createRadialGradient(sx, sy, 0, sx, sy, 20);
        holeG.addColorStop(0, '#0a0a0e'); holeG.addColorStop(1, '#1a1a20');
        circ(sx, sy, 20, null); cx.fillStyle = holeG; cx.fill();
        circ(sx, sy, 20, null, '#0a0a0e', 2);

        // Резиновая шляпка
        const nx = sx + tx * 5, ny = sy + ty * 5;
        const capG = cx.createRadialGradient(nx - 3, ny - 3, 1, nx, ny, 13);
        capG.addColorStop(0, '#3a3a46'); capG.addColorStop(0.6, '#252530'); capG.addColorStop(1, '#0f0f14');
        circ(nx, ny, 13, null); cx.fillStyle = capG; cx.fill();
        circ(nx, ny, 13, null, '#444450', 1.5);

        // Текстура «шершавая резина»
        cx.save();
        cx.beginPath(); cx.arc(nx, ny, 12, 0, Math.PI * 2); cx.clip();
        cx.globalAlpha = 0.12;
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            circ(nx + Math.cos(a) * 7, ny + Math.sin(a) * 7, 2.5, '#fff');
        }
        cx.globalAlpha = 1; cx.restore();

        // Блик
        cx.save();
        cx.globalAlpha = 0.28;
        cx.beginPath(); cx.ellipse(nx - 3, ny - 4, 4, 2.5, -Math.PI / 4, 0, Math.PI * 2);
        cx.fillStyle = '#fff'; cx.fill();
        cx.globalAlpha = 1; cx.restore();
    }

    // ── D-Pad ─────────────────────────────────────────────────
    function drawDpad(dx, dy, dUp, dRt, dDn, dLt) {
        const armW = 13, armH = 34, cr = 4;
        // Фон крестовины
        circ(dx, dy, 26, '#141418');

        const dirs = [
            { x: dx - armW / 2, y: dy - armH - armW / 2, w: armW, h: armH, p: dUp, arrow: '▲', ax: dx, ay: dy - armH / 2 - armW / 2 + 4 },
            { x: dx + armW / 2, y: dy - armW / 2, w: armH, h: armW, p: dRt, arrow: '▶', ax: dx + armH / 2 + armW / 2 - 4, ay: dy },
            { x: dx - armW / 2, y: dy + armW / 2, w: armW, h: armH, p: dDn, arrow: '▼', ax: dx, ay: dy + armH / 2 + armW / 2 - 4 },
            { x: dx - armH - armW / 2, y: dy - armW / 2, w: armH, h: armW, p: dLt, arrow: '◀', ax: dx - armH / 2 - armW / 2 + 4, ay: dy },
        ];
        dirs.forEach(({ x, y, w, h, p, arrow, ax, ay }) => {
            pill(x, y, w, h, cr, p ? '#3a3a48' : '#222228', p ? '#555' : '#30303a', 1.5);
            if (p) { cx.globalAlpha = 0.2; pill(x + 1, y + 1, w - 2, h - 2, cr, '#fff'); cx.globalAlpha = 1; }
            cx.fillStyle = p ? '#aaa' : '#484850';
            cx.font = 'bold 9px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText(arrow, ax, ay);
        });

        // Центр крестовины
        pill(dx - armW / 2, dy - armW / 2, armW, armW, 2, '#1a1a20');
    }

    // ── ABXY кнопки ──────────────────────────────────────────
    function drawFace(bx, by, label, fc, isPressed) {
        const r = 12, depth = isPressed ? 1 : 4;
        // Тень / боковина
        circ(bx, by + depth, r, 'rgba(0,0,0,0.5)');
        // Свечение
        if (isPressed) {
            const gg = cx.createRadialGradient(bx, by, 0, bx, by, r + 10);
            gg.addColorStop(0, fc.glow + '88'); gg.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = gg; cx.beginPath(); cx.arc(bx, by, r + 10, 0, Math.PI * 2); cx.fill();
        }
        // Основа
        const bg = cx.createRadialGradient(bx - 3, by - 3, 1, bx, by, r);
        bg.addColorStop(0, isPressed ? fc.glow : fc.col);
        bg.addColorStop(0.6, fc.col);
        bg.addColorStop(1, fc.col + 'aa');
        circ(bx, by, r, null); cx.fillStyle = bg; cx.fill();
        circ(bx, by, r, null, 'rgba(0,0,0,0.35)', 1.5);
        // Блик
        cx.save(); cx.globalAlpha = isPressed ? 0.12 : 0.28;
        cx.beginPath(); cx.ellipse(bx - 3, by - 3, 4, 2.5, -Math.PI / 4, 0, Math.PI * 2);
        cx.fillStyle = '#fff'; cx.fill(); cx.globalAlpha = 1; cx.restore();
        // Буква
        cx.fillStyle = 'rgba(255,255,255,0.9)';
        cx.font = `bold 10px Orbitron,sans-serif`;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(label, bx, by + 0.5);
    }

    // ── Кнопки меню ───────────────────────────────────────────
    function drawMenu(ox, oy) {
        // View (≡)
        pill(ox - 36, oy - 7, 26, 14, 7, '#1c1c22', '#2e2e38', 1);
        cx.fillStyle = '#555'; cx.font = '8px sans-serif';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('VIEW', ox - 23, oy);

        // Menu (⋮)
        pill(ox + 10, oy - 7, 26, 14, 7, '#1c1c22', '#2e2e38', 1);
        cx.fillStyle = '#555'; cx.font = '8px sans-serif';
        cx.fillText('MENU', ox + 23, oy);

        // Xbox/Home кнопка
        const hp = homeTimer > 0;
        const hg = cx.createRadialGradient(ox - 1, oy - 16 - 1, 1, ox, oy - 16, 13);
        hg.addColorStop(0, hp ? '#00ddff' : '#00aae0');
        hg.addColorStop(0.5, hp ? '#006699' : '#004466');
        hg.addColorStop(1, '#001122');
        circ(ox, oy - 16, 13, null); cx.fillStyle = hg; cx.fill();
        circ(ox, oy - 16, 13, null, hp ? '#00ccff' : '#005588', hp ? 2 : 1.5);
        if (hp) {
            cx.globalAlpha = 0.4;
            const halo = cx.createRadialGradient(ox, oy - 16, 0, ox, oy - 16, 22);
            halo.addColorStop(0, '#00ccff'); halo.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = halo; cx.fillRect(ox - 22, oy - 38, 44, 44);
            cx.globalAlpha = 1;
        }
        cx.fillStyle = hp ? '#fff' : '#aaddff';
        cx.font = '12px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('✕', ox, oy - 15.5);
    }

    let homeTimer = 0;
    setInterval(() => {
        if (Math.random() > 0.6) { homeTimer = 25; doShake(); }
    }, 2500);

    // ── Тень под геймпадом ────────────────────────────────────
    function drawShadow(ox, oy) {
        cx.save();
        cx.globalAlpha = 0.22;
        cx.filter = 'blur(20px)';
        cx.beginPath(); cx.ellipse(ox, oy + 155, 130, 30, 0, 0, Math.PI * 2);
        cx.fillStyle = '#000'; cx.fill();
        cx.filter = 'none'; cx.globalAlpha = 1;
        cx.restore();
    }

    // ── Фон ───────────────────────────────────────────────────
    function drawBg(ox, oy) {
        const bg = cx.createRadialGradient(ox, oy, 10, ox, oy, 180);
        bg.addColorStop(0, 'rgba(0,160,255,0.06)');
        bg.addColorStop(0.6, 'rgba(0,80,180,0.03)');
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = bg; cx.fillRect(0, 0, W, H);
    }

    // ── Частицы ───────────────────────────────────────────────
    function tickParts() {
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.04;
            if (p.life <= 0) { parts.splice(i, 1); continue; }
            cx.globalAlpha = p.life * .85;
            cx.fillStyle = p.col; cx.shadowColor = p.col; cx.shadowBlur = 5;
            cx.beginPath(); cx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); cx.fill();
            cx.shadowBlur = 0;
        }
        cx.globalAlpha = 1;
    }

    // ── Маппинг позиций кнопок ────────────────────────────────
    // Рассчитываются относительно центра ox,oy
    function getLayout(ox, oy) {
        return {
            // Лицевые кнопки (правая сторона)
            A: { x: ox + 90, y: oy + 22 },
            B: { x: ox + 112, y: oy + 0 },
            X: { x: ox + 68, y: oy + 0 },
            Y: { x: ox + 90, y: oy - 22 },
            // Левый стик
            LS: { x: ox - 75, y: oy + 30 },
            // Правый стик
            RS: { x: ox + 40, y: oy + 55 },
            // D-Pad
            DP: { x: ox - 90, y: oy - 18 },
        };
    }

    // ── Главный цикл ─────────────────────────────────────────
    function frame() {
        cx.clearRect(0, 0, W, H);

        // Обновление состояний
        pressTimer.forEach((_, i) => {
            if (pressed[i]) {
                pressTimer[i]--;
                if (pressTimer[i] <= 0) pressed[i] = false;
            }
        });
        if (homeTimer > 0) homeTimer--;
        if (shake.life > 0) { shake.life--; if (shake.life === 0) { shake.x = 0; shake.y = 0; } }

        // Плавное парение
        const floatY = Math.sin(t * 0.024) * 7;
        const floatR = Math.sin(t * 0.017) * 1.8;

        const ox = W / 2 + shake.x;
        const oy = H / 2 - 25 + floatY + shake.y;

        drawBg(ox, oy);
        drawShadow(ox, oy + 25 - floatY); // тень не двигается вместе

        cx.save();
        cx.translate(ox, oy);
        cx.rotate(floatR * Math.PI / 180);
        cx.translate(-ox, -oy);

        drawTriggers(ox, oy);
        drawBumpers(ox, oy, pressed[4], pressed[5]);
        drawBody(ox, oy);

        const L = getLayout(ox, oy);

        // Стики
        const lsT = { x: Math.sin(t * 0.04) * 0.6, y: Math.cos(t * 0.033) * 0.5 };
        const rsT = { x: Math.sin(t * 0.05 + 1) * 0.5, y: Math.cos(t * 0.044 + 2) * 0.6 };
        drawStick(L.LS.x, L.LS.y, lsT.x, lsT.y);
        drawStick(L.RS.x, L.RS.y, rsT.x, rsT.y);

        // D-Pad
        drawDpad(L.DP.x, L.DP.y, pressed[6], pressed[7], pressed[8], pressed[9]);

        // ABXY
        [['A', 0], ['B', 1], ['X', 2], ['Y', 3]].forEach(([k, i]) => {
            const { x, y } = L[k];
            const isP = pressed[i];
            if (isP) { burst(x, y, FACE[k].glow); doShake(); }
            drawFace(x, y, k, FACE[k], isP);
        });

        // Меню
        drawMenu(ox, oy);

        cx.restore();

        tickParts();
        t++;
        requestAnimationFrame(frame);
    }

    frame();
})();


/* ========================
   КУРСОР
   ======================== */
const cursor = document.querySelector('.cursor');
const trail = document.querySelector('.cursor-trail');

let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    trailX += (e.clientX - trailX) * 0.18;
    trailY += (e.clientY - trailY) * 0.18;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
});

function animateTrail() {
    requestAnimationFrame(animateTrail);
}
animateTrail();

/* ========================
   ФОНОВЫЕ ЧАСТИЦЫ
   ======================== */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let W, H;
const particles = [];
const NUM = 80;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

for (let i = 0; i < NUM; i++) {
    particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? '#00ffcc' : '#ffffff'
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
    });

    // Линии между близкими частицами
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 255, 204, ${0.08 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function loop() {
    drawParticles();
    requestAnimationFrame(loop);
}
loop();


/* ========================
   НАВИГАЦИЯ HERO → CATALOG
   ======================== */
const ctaBtn = document.getElementById('ctaBtn');
const heroSection = document.querySelector('.hero');
const catalogSection = document.querySelector('.catalog');

function goToCatalog() {
    heroSection.classList.add('fade-out');
    setTimeout(() => {
        heroSection.style.display = 'none';
        catalogSection.classList.add('show');
        document.querySelectorAll('.game-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.15}s`;
        });
    }, 800);
}

function goToHero() {
    catalogSection.classList.remove('show');
    setTimeout(() => {
        catalogSection.style.display = 'none';
        heroSection.style.display = 'flex';
        requestAnimationFrame(() => { heroSection.classList.remove('fade-out'); });
    }, 50);
}

if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToCatalog();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (catalogSection && catalogSection.classList.contains('show')) goToHero();
    }
});

/* ========================
   ПАРАЛЛАКС НА HERO
   ======================== */
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;
    const rx = (e.clientX / window.innerWidth - 0.5) * 12;
    const ry = (e.clientY / window.innerHeight - 0.5) * 8;
    hero.style.transform = `perspective(1000px) rotateY(${rx}deg) rotateX(${-ry}deg)`;
});

/* ========================
   3D НАКЛОН КАРТОЧЕК
   ======================== */
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-14px) scale(1.01) perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.4s, box-shadow 0.4s';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'border-color 0.4s, box-shadow 0.4s';
    });
});
