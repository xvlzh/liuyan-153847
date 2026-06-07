// my_algorithm.js
(function() {
    // 滤波参数 —— 截止频率约 5Hz（采样率按 50Hz 估算）
    const alpha = 0.2;
    // 重力估计初始值
    let gravityEst = { x: 0, y: 0, z: 0 };
    let firstFrame = true;
    
    // DOM 元素
    const linXSpan = document.getElementById('linX');
    const linYSpan = document.getElementById('linY');
    const linZSpan = document.getElementById('linZ');
    const rawXSpan = document.getElementById('rawX');
    const rawYSpan = document.getElementById('rawY');
    const rawZSpan = document.getElementById('rawZ');
    const statusSpan = document.getElementById('status');
    
    let motionHandler = null;
    
    function onDeviceMotion(event) {
        const accWithG = event.accelerationIncludingGravity;
        if (!accWithG) {
            statusSpan.innerText = '当前设备不支持 accelerationIncludingGravity';
            return;
        }
        let rawX = (accWithG.x !== undefined && accWithG.x !== null) ? accWithG.x : 0;
        let rawY = (accWithG.y !== undefined && accWithG.y !== null) ? accWithG.y : 0;
        let rawZ = (accWithG.z !== undefined && accWithG.z !== null) ? accWithG.z : 0;
        rawXSpan.innerText = (rawX * 100).toFixed(2);
        rawYSpan.innerText = (rawY * 100).toFixed(2);
        rawZSpan.innerText = (rawZ * 100).toFixed(2);
        
        if (firstFrame) {
            gravityEst = { x: rawX, y: rawY, z: rawZ };
            firstFrame = false;
            linXSpan.innerText = (0).toFixed(2);
            linYSpan.innerText = (0).toFixed(2);
            linZSpan.innerText = (0).toFixed(2);
            return;
        }
        gravityEst.x = alpha * rawX + (1 - alpha) * gravityEst.x;
        gravityEst.y = alpha * rawY + (1 - alpha) * gravityEst.y;
        gravityEst.z = alpha * rawZ + (1 - alpha) * gravityEst.z;
        let linX = rawX - gravityEst.x;
        let linY = rawY - gravityEst.y;
        let linZ = rawZ - gravityEst.z;
        linXSpan.innerText = (linX * 100).toFixed(2);
        linYSpan.innerText = (linY * 100).toFixed(2);
        linZSpan.innerText = (linZ * 100).toFixed(2);
        
        if (statusSpan.innerText.includes('等待') || statusSpan.innerText.includes('未授权')) {
            statusSpan.innerText = '数据实时更新中（静止时应接近 0 Gal）';
        }
    }
    
    function startListening() {
        if (motionHandler) {
            window.removeEventListener('devicemotion', motionHandler);
        }
        motionHandler = onDeviceMotion;
        window.addEventListener('devicemotion', motionHandler);
        firstFrame = true;
    }
    
    function requestSensorPermission() {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startListening();
                        statusSpan.innerText = '已授权，正在获取高分辨率数据...';
                    } else {
                        statusSpan.innerText = '授权失败，无法获取传感器数据';
                    }
                })
                .catch(err => {
                    statusSpan.innerText = '授权出错：' + err.message;
                });
        } else {
            startListening();
            statusSpan.innerText = '自动启动（安卓/旧iOS），静止时应接近 0 Gal';
        }
    }
    
    const btn = document.getElementById('requestBtn');
    btn.onclick = function() {
        requestSensorPermission();
    };
    
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function') {
        startListening();
        statusSpan.innerText = '自动启动（安卓/旧iOS），静止时应接近 0 Gal';
    } else {
        statusSpan.innerText = '请点击上方按钮授权传感器，以获得高分辨率线性加速度';
    }
})();
