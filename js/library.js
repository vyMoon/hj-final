'use strict';

// функция поиска элементов на странице
// принимает класс и контэйнер
function finder(needle, container) {
    if (container !== undefined) {
        return container.querySelector(needle);
    }
    return document.querySelector(needle);
}

// ищет и возвращает массив этмл элементов
// принимает класс и контэйнер
function finderAll(needle, container) {
    if (container !== undefined) {
        return Array.from( container.querySelectorAll(needle) );
    }
    return Array.from( document.querySelectorAll(needle) );
}

// создает и возвращает элемент хтмл, принимет название тэега и классы, оба паратметра строки
function elementMaker(tag, ...classes) {
    const element = document.createElement(tag);
    if (classes.length > 0) {
        classes.forEach( el => element.classList.add(el) )
    }
    return element;
}


function commentMaker(date, message) {
    const dateStr = elementMaker('p', 'comment__time');
    dateStr.innerText = date;
    const messageStr = elementMaker('p', 'comment__message');
    messageStr.innerText = message;
    const commentContainer = elementMaker('div', 'comment');
    commentContainer.appendChild(dateStr);
    commentContainer.appendChild(messageStr);

    return commentContainer
}

function commentFormMaker() {
    const form = elementMaker('form', 'comments__form');
    form.appendChild(elementMaker('span', 'comments__marker'));

    const check = elementMaker('input', 'comments__marker-checkbox');
    check.setAttribute('type', 'checkbox');
    form.appendChild(check);

    const body = elementMaker('div', 'comments__body');

    const loaderContainer = elementMaker('div', 'comment');
    loaderContainer.style.display = 'none';

    const loader = elementMaker('div', 'loader')
    for (let i = 0; i < 5; i++) {
        loader.appendChild(elementMaker('span'));
    }
    loaderContainer.appendChild(loader);
    body.appendChild(loaderContainer);

    const textArea = elementMaker('textarea', 'comments__input');
    textArea.setAttribute('type', 'text');
    textArea.setAttribute('placeholder', 'Напишите ответ...');
    body.appendChild(textArea);

    const inputClose = elementMaker('input', 'comments__close');
    inputClose.setAttribute('type', 'button');
    inputClose.setAttribute('value', 'Закрыть');
    body.appendChild(inputClose);

    const inputSend = elementMaker('input', 'comments__submit');
    inputSend.setAttribute('type', 'submit');
    inputSend.setAttribute('value', 'Отправить');
    body.appendChild(inputSend);

    form.appendChild(body);

    return form;
}


// вид по умолчанию при открытии

function start() {
    commentsForm.style.display = 'none';
    img.src = '';

    menuElementsHiden();
    menuNew.style.display = 'inline-block';

    if (localStorage.menuX !== undefined && localStorage.menuY !== undefined) {
        menu.style.top = localStorage.menuY + 'px';
        menu.style.left = localStorage.menuX + 'px';
        checkMenuSize();
    }

    const input = document.createElement('input');
    input.classList.add('input');
    input.style.display = 'none';
    input.type = 'file';
    input.multiple = false;
    input.accept = 'image/jpg';

    inputContainer.appendChild(input);
    app.appendChild(inputContainer);

    const dragError = imgTypeError.cloneNode(true);
    dragError.classList.add('dragError');
    finder('.error__message', dragError).innerText = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню.';
    imgTypeError.parentElement.insertBefore(dragError, imgTypeError.nextElementSibling);

    const serverError = imgTypeError.cloneNode(true);
    serverError.classList.add('serverError');
    finder('.error__message', serverError).innerText = 'Попробуйте позже';
    imgTypeError.parentElement.insertBefore(serverError, imgTypeError.nextElementSibling);

    if (sessionStorage.id) {

        const url = `${apiURL}/pic/${sessionStorage.id}`;
    
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', function() {
            
            if (xhr.status === 200) {
                
                const response = JSON.parse(xhr.responseText);
                // console.log(response)
                imgWorker(response);
                menuShowCommentsItem();
              
                if (response.mask) {
                    mask.src = response.mask;
                }

                if (response.comments) {
                    for (let i in response.comments) {
                        
                        commentAdder(
                            response.comments[i].top, 
                            response.comments[i].left, 
                            response.comments[i].message, 
                            response.comments[i].timestamp
                        )
                    }
                }
            }
        })
        xhr.send();
    }

}

////////////////////////работа меню

// скрывает все элементы меню
function menuElementsHiden() {
    menuNew.style.display = 'none';
    menuDraw.style.display = 'none';
    menuShare.style.display = 'none';
    menuBurger.style.display = 'none';
    menuComments.style.display = 'none';
    menuDrawTools.style.display = 'none';
    menuShareTools.style.display = 'none';
    menuCommentsTools.style.display = 'none';  
}

// показывает только главные элементы меню
function menuShowMainItem() {
    menuElementsHiden()
    menuNew.style.display = 'inline-block';
    menuDraw.style.display = 'inline-block';
    menuShare.style.display = 'inline-block';
    menuComments.style.display = 'inline-block';
}

function menuShowShareItem() {
    menuElementsHiden();
    menuShare.style.display = 'inline-block';
    menuBurger.style.display = 'inline-block';
    menuShareTools.style.display = 'inline-block';
}

function menuShowCommentsItem() {
    menuBurger.style.display = 'inline-block';
    menuComments.style.display = 'inline-block';
    menuCommentsTools.style.display = 'inline-block';

    commentsContainer.style.zIndex = 2;
    doodle.style.zIndex = 1;

    commentsContainer.addEventListener('click', commentWorker);
}

function menuWorker(event) {

    if (event.target.classList.contains('burger') || event.target.parentElement.classList.contains('burger')) {
        menuShowMainItem();
        eventListenersRemover();
    }

    if (event.target.classList.contains('comments') || event.target.parentElement.classList.contains('comments')) {
        menuElementsHiden();
        menuShowCommentsItem();
    }

    if (event.target.classList.contains('draw') || event.target.parentElement.classList.contains('draw')) {
        menuElementsHiden();
        menuDraw.style.display = 'inline-block';
        menuBurger.style.display = 'inline-block';
        menuDrawTools.style.display = 'inline-block';

        commentsContainer.style.zIndex = 1;
        doodle.style.zIndex = 2;
        paint();
    }

    if (event.target.classList.contains('share') || event.target.parentElement.classList.contains('share')) {
        menuShowShareItem()
    }

    checkMenuSize();

    if (event.target.classList.contains('new') || event.target.parentElement.classList.contains('new')) {
        // ищем инпут и кликаем его
        const input = finder('input', finder('.inputContainer'));
        input.click();

        input.addEventListener('change', function(event) {
            event.stopPropagation();
            const file = event.currentTarget.files[0];  // получаем файл
            imgLoad(file);                              // отображаем файл
        })
    }
}

// изменяет  цвет рисования функция для эвент листенера на инпуты
function actualColorChanger(event) {
    actualColor = paintingColors[event.target.value];
}


///////////// передвигаем меню

// проверяем, что клик произошел на нужном элементе меню, помещаем меню в переменную, это осзначет 
// что его можно двигать запоминаем место клика
function isItMenu(event) {
    if (event.target.classList.contains('drag')) {
        moved = event.target.parentElement;
        const bounds = event.target.getBoundingClientRect();
        shiftX = event.pageX - bounds.left - window.pageXOffset;
        shiftY = event.pageY - bounds.top - window.pageYOffset;
    }
}

// передвигаем меню при этом смотрим не выходит ли меню за пределы  окна
function menuMover(event) {
    if (moved) {
        event.preventDefault();

        const menuX = event.pageX - shiftX; // координата верхней левой точки
        // максимально возможная коррдината х чтобы менбю не вышло за пределы окна
        const xMax = document.documentElement.clientWidth - Math.ceil(moved.getBoundingClientRect().width);
        // выбираем меньшую точку
        const x = Math.min(menuX, xMax);
        // передвигаем меню в выбранну точку при этом проверяем чтобы оно не вышло за пределы окна
        moved.style.left = (x > 0) ? x + 'px' : 0 + 'px';

        // аналогично с координатой у
        const menuY = event.pageY - shiftY; 
        const yMax = document.documentElement.clientHeight - moved.offsetHeight;
        const y = Math.min(menuY, yMax);
       
        moved.style.top = (y > 0) ? y + 'px' : 0 + 'px';
    }
}

// закнчиваем двигать меню 
function stopMenuMove() {
    if (moved) {
        moved = undefined;
    }
    const menuBound = menu.getBoundingClientRect();
    // console.log(menuBound.x)
    localStorage.menuX = menuBound.x;
    localStorage.menuY = menuBound.y;
    // console.log(localStorage.menuX)
}

// изменяет положение меню, если при изменении вида меню, оно перстает влажить в размеры документа по правому краю
function checkMenuSize() {
    // вычисляем размер меню без бордеров
    const menuWidth = Array.from(menu.children).reduce( (memo, el) => {
        memo += el.getBoundingClientRect().width;
        return memo;
    }, 0)
    //вычисляем размер бордеров
    const bordersWidth = parseInt(getComputedStyle(menu).borderLeftWidth) + parseInt(getComputedStyle(menu).borderRightWidth);
    //проверяем выходит ли меню за пределы окна
    if (menu.getBoundingClientRect().x + Math.ceil(menuWidth) > document.documentElement.offsetWidth) {
        //  если выходит, то передвигаем влево на минимальное безопасное расстояние
        menu.style.left = document.documentElement.offsetWidth - Math.ceil(menuWidth) - bordersWidth + 'px';
    }
}

function eventListenersRemover() {
    doodle.removeEventListener("mousedown", canvasMousedown);
    doodle.removeEventListener("mouseup", canvasDrawingFalse);
    doodle.removeEventListener("mouseleave", canvasDrawingFalse);
    doodle.removeEventListener("mousemove", canvasMousemove);

    commentsContainer.removeEventListener('click', commentWorker);
}


//////////////////////////////////////////////работа с изображением

function imgLoad(file) {
    finderAll('.error', app).forEach( (el) => {
        el.style.display = 'none';
    })

    const imageTypeRegExp = /^image\//;

    if (imageTypeRegExp.test(file.type)) {

        const imgFormData = new FormData();
        imgFormData.append('title', file.name);
        imgFormData.append('image', file);

        const imgXML = new XMLHttpRequest();
        imgXML.open('POST', 'https://neto-api.herokuapp.com/pic/');

        imgXML.addEventListener('loadstart', () => imgLoader.style.display = 'block');
        imgXML.addEventListener('loadend', () => imgLoader.style.display = 'none');
        imgXML.addEventListener('error', () => finder('.serverError').style.display = 'block');

        imgXML.addEventListener('load', function() {

            curves = [];
            finderAll('.comments__form', commentsContainer).forEach( el => {
                el.parentElement.removeChild(el);
            })

            if (imgXML.status === 200) {

                const response = JSON.parse(imgXML.responseText);

                imgWorker(response);
                menuShowShareItem();

            }

            if (imgXML.status >= 500) {
                finder('.serverError').style.display = 'block';
            }
        });

        imgXML.send(imgFormData);       

    } else { // иначе осталяем тольок пункт меню загрузить и выводим ошибку
        start();
        imgTypeError.style.display = 'block';
    }

}

function imgWorker(response) {
    img.src = response.url;
    mask.src = '';

    sessionStorage.id = response.id;

    const ws = new WebSocket(`wss://neto-api.herokuapp.com/pic/${sessionStorage.id}`);

    doodle.addEventListener('mouseup', debounce);
    function debounce() {
        return setTimeout( () => {
            if (!drawing && needsSend) {
                console.log('sendsendsendsend');
                doodle.toBlob((el) => ws.send(el));
                needsSend = false;
            }
        }, 1000)
    }

    ws.addEventListener('message', wsMessage)

    img.addEventListener('load', function() {

        imgSrc = true;
        const imgBound = img.getBoundingClientRect();

        elementStyler(doodle, imgBound);
        elementStyler(commentsContainer, imgBound);
        commentsContainer.style.width = imgBound.width + 'px';
        commentsContainer.style.height = imgBound.height + 'px';
        if (response.mask) {
            elementStyler(mask, imgBound);
        }
    });
}


function elementStyler(doodle, imgBound) {
    doodle.style.position = 'absolute';
    doodle.style.display = 'block';
    doodle.width = imgBound.width;
    doodle.height = imgBound.height;
    doodle.style.top = '50%';
    doodle.style.left = '50%';
    doodle.style.transform = 'translate(-50%, -50%)';
}

function imgLoadDrop(event) {
    event.preventDefault();                             // предовращаем открытие
    if (!imgSrc) {
        const file = event.dataTransfer.files[0];       // получаем файл
        imgLoad(file);                                  // отображаем файл
    } else {
        finder('.dragError').style.display = 'block';   // отображает ошибку, если файл не  того типа
    }
}

//////////////////////////////////////// функции рисования
// curves and figures
function circle(point, color) {
    ctx.beginPath();
    ctx.arc(...point, BRUSH_RADIUS / 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}
    
function smoothCurveBetween (p1, p2) {
    // Bezier control point
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.quadraticCurveTo(...p1, ...cp);
}
    
function smoothCurve(points, color) {
    ctx.beginPath();
    ctx.lineWidth = BRUSH_RADIUS;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.moveTo(...points[0]);
    
    for(let i = 1; i < points.length - 1; i++) {
        smoothCurveBetween(points[i], points[i + 1]);
    }
    
    ctx.strokeStyle = color;
    ctx.stroke();
}
    
function tick () {
    if(needsRepaint) {
        ctx.clearRect(0, 0, doodle.width, doodle.height);
    
        curves.forEach((curve) => {
            circle(curve.curve[0], curve.color);
            smoothCurve(curve.curve, curve.color);
        });

        needsRepaint = false;
    }
    window.requestAnimationFrame(tick);
}

function paint() {

    doodle.addEventListener("mousedown", canvasMousedown);
    doodle.addEventListener("mouseup", canvasDrawingFalse);
    doodle.addEventListener("mouseleave", canvasDrawingFalse);
    doodle.addEventListener("mousemove", canvasMousemove);

    tick();
}

function canvasMousedown(event) {
    drawing = true;

    const curve = {}; // create a new curve
    curve.color = actualColor;
    curve.curve = [];
    // curve.push(makePoint(evt.offsetX, evt.offsetY));
    curve.curve.push([event.offsetX, event.offsetY]);
    curves.push(curve); // add the curve to the array of curves
    needsRepaint = true;
}

function canvasMousemove(event) {
    if (drawing) {
        // add a point
        const point = [event.offsetX, event.offsetY]
        curves[curves.length - 1].curve.push(point);
        needsRepaint = true;
    }
}

function canvasDrawingFalse() {
    drawing = false;
    needsSend = true;
}

///////////////////////////////////////////////////комментарии

function commentWorker(event) {

    event.stopPropagation();

    if (event.currentTarget === event.target) {

        newCommentChecker();

        commentFormAppender(event.offsetY, event.offsetX);

    }

    if (event.target.classList.contains('comments__close')) {
       
        if (event.target.parentElement.parentElement.dataset.id === 'new') {
            event.target.parentElement.parentElement.parentElement.removeChild(event.target.parentElement.parentElement);
        } else {
            finder('.comments__marker-checkbox', event.target.parentElement.parentElement).checked = false;
        }

    }

    if (event.target.classList.contains('comments__submit')) {
        event.preventDefault();
        
        const commentText = finder('.comments__input', event.target.parentElement).value.trim();
        
        if (commentText !== '') {

            const y = parseInt(event.target.parentElement.parentElement.style.top);
            const x = parseInt(event.target.parentElement.parentElement.style.left);

            // приходит 500 ошибка и сообщение что не заданы кординаты
            // const messageFormData = new FormData();
            // messageFormData.append('message', finder('.comments__input', event.target.parentElement).value);
            // messageFormData.append('left', commentBounding.left);
            // messageFormData.append('top', commentBounding.top);
            // imgFormData.append('title', file.name);

            // приходит 500 ошибка и сообщение что не заданы кординаты
            // const body = {
            //     left: commentBounding.left,
            //     top: commentBounding.top,
            //     message: finder('.comments__input', event.target.parentElement).value
            // }

            // приходит ответ
            const body = `message=${commentText}&left=${x}&top=${y}`;

            const messageXHR = new XMLHttpRequest();
            const url = `${apiURL}/pic/${sessionStorage.id}/comments`;

            const loader = commentLoaderFinder(event.target.parentElement);
            
            messageXHR.open('POST', url);
            messageXHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            messageXHR.addEventListener('loadstart', () => {
                finder('.comments__input', event.target.parentElement).value = '';
                loader.style.display = 'block';
            });
            messageXHR.addEventListener('loadend', () => loader.style.display = 'none');
            messageXHR.addEventListener('load', function() {
                console.log(messageXHR.responseText);
            })

            messageXHR.send(body);
        }
    }

}

// создает форму комментария и доавляет ее в контейнер принимает координаты комментария числа
function commentFormAppender(y, x) {

    const comment = commentFormMaker();
    comment.style.display = 'block';
    comment.style.position = 'absolute';
    comment.style.top = y + 'px';
    comment.style.left = x + 'px';
    comment.dataset.id = 'new';

    const commentCheckBox = finder('.comments__marker-checkbox', comment);
    commentCheckBox.addEventListener('click', onlyOneOpenCommentBody)

    commentsContainer.appendChild(comment);

}

// показывает все комментарии
function commentsShower() {
    finderAll('.comments__form', commentsContainer).forEach( el => {
        el.style.display = 'block';
    })
}

// скрывает все комментарии
function commentsHider() {
    finderAll('.comments__form', commentsContainer).forEach( el => {
        el.style.display = 'none';
    })
}

// ищет и возвращает контейнер с индикацией загрузки комментария
function commentLoaderFinder(constainer) {
    return  finderAll( '.comment', constainer).find( el => {
        if (el.firstElementChild.classList.contains('loader')) {
            return true;
        }
    })
}

//  ищет и возвращает все коментарии в коммент контейнере 
function commentsFinder() {
    return finderAll('.comments__form', commentsContainer);
}


// проверяет кооментарии, удаляет не активные комментарии
// или закрывает открытое тело активного комментария
// используется при клике на чекр открывающий тело комментария
function onlyOneOpenCommentBody() {
    const comments = commentsFinder();
    comments.forEach( el => {
        if (event.target !== finder('.comments__marker-checkbox', el)) {
            if (el.dataset.id === 'new') {
                el.parentElement.removeChild(el);
            } else {
                finder('.comments__marker-checkbox', el).checked = false;
            }
        }
    })
}

// делает тоже самое что предыдущая
// используется при добавлении нового коментария при клики на коммент контейнер
function newCommentChecker() {
    const comments = commentsFinder();
    comments.forEach( el => {
        if (el.dataset.id === 'new') {
            el.parentElement.removeChild(el);
        } else {
            finder('.comments__marker-checkbox', el).checked = false;
        } 
    })
}

// принимает штамп даты возвращает дату в формате комментария
function dateMaker(timestamp) {
    const date = new Date(timestamp);
    let mounth = '' + (date.getMonth() + 1);
    if (mounth.length === 1) {
        mounth = '0' + mounth;
    }

    return `${date.getDate()}.${mounth}.${('' + date.getFullYear()).slice(2)} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// используется на собитии message вэбсокета
function wsMessage(event) {
    const response = JSON.parse(event.data)

    if (response.event === 'comment') {
        // при событии сообщение добавляет сооющение в нужную форму
        commentAdder(response.comment.top, response.comment.left, response.comment.message, response.comment.timestamp);

    }

    if (response.event === 'mask') {
        // при событии маска обновляем маску
        console.log('mask uprade')
        const imgBound = img.getBoundingClientRect();
        elementStyler(mask, imgBound);
        mask.src = response.url;
    }

}

// добавляет комментария вформу комментария
//принимает координаты нужной формы комментария - числа, текст сообщения и штамп даты
function commentAdder(top, left, message, timestamp) {
    // ищем все комментарии
    const comments = commentsFinder();
    // ищем форму, в которую нужно давить комментария
    const currenComment = comments.find( el => {
        if (parseInt(el.style.top) === top && parseInt(el.style.left) === left) {
            return true;
        }
    })
    // если нашли
    if (currenComment) {
        // console.log(currenComment);
        currenComment.dataset.id = 'active';                  // помечаем форму как активную
        const dateStr = dateMaker(timestamp);                 // получаем струку с датой нужного формата
        // в тело комеентария вставляем комментарий перед лоадером, тоесть как последний на данный момент
        finder('.comments__body', currenComment) 
            .insertBefore( 
                commentMaker(dateStr, message), commentLoaderFinder(finder('.comments__body', currenComment)
            ))
    } else { 
        console.log('formcreating')
        // иначе создаем форму комментария в нужном месте
        // и запускам еще раз для добавления первого комментария
        //нужно в том случае, если функция используется при загрузке по ссылке или при обновлении страницы
        commentFormAppender(top, left);
        commentAdder(top, left, message, timestamp);
    }
}
