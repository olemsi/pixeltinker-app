const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Order state
const order = {
    service: null,
    serviceId: null,
    device: null,
    firmware: null,
    delivery: null
};

let currentStep = 0;
const stepNames = ['service', 'device', 'firmware', 'delivery', 'summary'];

// ====== DATA ======

const SERVICES = {
    reflash_meets: {
        label: '🔮 Версию MEETS / ON / Some',
        value: '🔮 Версию тамагочи meets/on/some'
    },
    reflash_smart_lang: {
        label: '💬 Язык SMART на английский',
        value: '💬 Язык тамагочи smart на английский',
        skipTo: 'delivery',
        autoDevice: 'Smart',
        autoFirmware: 'English'
    },
    reflash_idl_lang: {
        label: '💬 Язык iDL на английский',
        value: '💬 Язык для tmgc idl на английский',
        skipTo: 'delivery',
        autoDevice: 'iDL',
        autoFirmware: 'English'
    },
    reflash_mix: {
        label: '🧬 Версию M!X',
        value: '🧬 Версию для tmgc m!x'
    }
};

const DEVICES = {
    reflash_meets: [
        { label: '🇯🇵 Meets', value: '🇯🇵 Meets' },
        { label: '🇺🇸 On', value: '🇺🇸 On' },
        { label: '🇰🇷 Some', value: '🇰🇷 Some' }
    ],
    reflash_mix: [
        { label: '🛸 M!X Spacy', value: '🛸 M!X Spacy' },
        { label: '🎶 M!X Melody', value: '🎶 M!X Melody' },
        { label: '🌟 M!X Dream', value: '🌟 M!X Dream' },
        { label: '🎉 M!X Anniversary', value: '🎉 M!X Anniversary' }
    ]
};

const FIRMWARES = {
    reflash_meets: [
        { label: '🇺🇸 En Wonder Garden', value: '🇺🇸 English Wonder Garden' },
        { label: '🇺🇸 En Fairy', value: '🇺🇸 English Fairy' },
        { label: '🇺🇸 En Magic', value: '🇺🇸 English Magic' },
        { label: '🇯🇵 Jp Sanrio', value: '🇯🇵 Japanese Sanrio' },
        { label: '🇯🇵 Jp Fantasy', value: '🇯🇵 Japanese Fantasy' },
        { label: '🇯🇵 Jp Sweets', value: '🇯🇵 Japanese Sweets' },
        { label: '🇯🇵 Jp Pastel', value: '🇯🇵 Japanese Pastel' },
        { label: '🇯🇵 Jp Fairy', value: '🇯🇵 Japanese Fairy' },
        { label: '🇯🇵 Jp Magic', value: '🇯🇵 Japanese Magic' },
        { label: '🇰🇷 Kr Magic', value: '🇰🇷 Korean Magic' },
        { label: '🇰🇷 Kr Fairy', value: '🇰🇷 Korean Fairy' }
    ],
    reflash_mix: [
        { label: '🛸 M!X Spacy', value: '🛸 M!X Spacy' },
        { label: '🎶 M!X Melody', value: '🎶 M!X Melody' },
        { label: '🌟 M!X Dream', value: '🌟 M!X Dream' }
    ]
};

// ====== NAVIGATION ======

function showStep(name) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById('step-' + name);
    if (stepEl) stepEl.classList.add('active');

    currentStep = stepNames.indexOf(name);
    updateProgress(currentStep);

    if (currentStep > 0) {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }

    if (name === 'summary') {
        tg.MainButton.setText('💖 Оформить заказ');
        tg.MainButton.color = '#f8a4c8';
        tg.MainButton.textColor = '#ffffff';
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function updateProgress(step) {
    // Update dots
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
        dot.classList.toggle('filled', i <= step);
    });

    // Update lines
    document.querySelectorAll('.progress-line').forEach((line, i) => {
        line.classList.toggle('filled', i < step);
    });

    const service = SERVICES[order.serviceId];
    let totalSteps, currentNum;

    if (service && service.skipTo) {
        totalSteps = 3;
        if (step === 0) currentNum = 1;
        else if (step === 3) currentNum = 2;
        else currentNum = 3;
    } else {
        totalSteps = 5;
        currentNum = step + 1;
    }

    document.getElementById('step-label').textContent = `Шаг ${currentNum} из ${totalSteps}`;
}

// ====== SELECTIONS ======

function selectService(serviceId) {
    const service = SERVICES[serviceId];
    order.service = service.value;
    order.serviceId = serviceId;

    if (service.skipTo) {
        order.device = service.autoDevice;
        order.firmware = service.autoFirmware;
        showStep('delivery');
    } else {
        renderDevices(serviceId);
        showStep('device');
    }
}

function renderDevices(serviceId) {
    const container = document.getElementById('device-options');
    const devices = DEVICES[serviceId] || [];
    container.innerHTML = '';

    devices.forEach(d => {
        const btn = document.createElement('button');
        btn.className = 'cozy-btn';
        const emoji = d.label.split(' ')[0];
        const text = d.label.substring(d.label.indexOf(' ') + 1);
        btn.innerHTML = `<span class="btn-emoji">${emoji}</span><div class="btn-content"><span class="btn-title">${text}</span></div>`;
        btn.onclick = () => selectDevice(d.value);
        container.appendChild(btn);
    });
}

function selectDevice(value) {
    order.device = value;
    renderFirmwares(order.serviceId);
    showStep('firmware');
}

function renderFirmwares(serviceId) {
    const container = document.getElementById('firmware-options');
    const firmwares = FIRMWARES[serviceId] || [];
    container.innerHTML = '';

    if (firmwares.length > 4) {
        container.className = 'options firmware-grid';
    } else {
        container.className = 'options';
    }

    firmwares.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'cozy-btn';
        const emoji = f.label.split(' ')[0];
        const text = f.label.substring(f.label.indexOf(' ') + 1);
        btn.innerHTML = `<span class="btn-emoji">${emoji}</span><div class="btn-content"><span class="btn-title">${text}</span></div>`;
        btn.onclick = () => selectFirmware(f.value);
        container.appendChild(btn);
    });
}

function selectFirmware(value) {
    order.firmware = value;
    showStep('delivery');
}

function selectDelivery(value) {
    order.delivery = value;
    showSummary();
}

function showSummary() {
    document.getElementById('sum-service').innerHTML =
        `<span class="label">Услуга</span><span class="value">${order.service}</span>`;
    document.getElementById('sum-device').innerHTML =
        `<span class="label">Устройство</span><span class="value">${order.device}</span>`;
    document.getElementById('sum-firmware').innerHTML =
        `<span class="label">Прошивка</span><span class="value">${order.firmware}</span>`;
    document.getElementById('sum-delivery').innerHTML =
        `<span class="label">Доставка</span><span class="value">${order.delivery}</span>`;

    showStep('summary');
}

// ====== SUBMIT ======

function submitOrder() {
    tg.MainButton.disable();
    tg.MainButton.showProgress();

    const data = {
        service: order.service,
        device: order.device,
        firmware: order.firmware,
        delivery: order.delivery
    };

    tg.sendData(JSON.stringify(data));
}

// ====== TELEGRAM EVENTS ======

tg.MainButton.onClick(submitOrder);

tg.BackButton.onClick(() => {
    if (currentStep <= 0) return;

    const service = SERVICES[order.serviceId];

    if (currentStep === 4) {
        showStep('delivery');
    } else if (currentStep === 3) {
        if (service && service.skipTo) {
            showStep('service');
        } else {
            showStep('firmware');
        }
    } else if (currentStep === 2) {
        showStep('device');
    } else if (currentStep === 1) {
        showStep('service');
    }
});

// ====== INIT ======

showStep('service');
