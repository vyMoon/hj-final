'use strict';

// после загрузки страницы
document.addEventListener('DOMContentLoaded', start);

// передвигаем меню
document.addEventListener('mousedown', isItMenu);
document.addEventListener('mousemove', menuMover);
document.addEventListener('mouseup', stopMenuMove);

// загрузка файлов drop
app.addEventListener('drop', imgLoadDrop);
// запрещаем браузеру открывать файлы
app.addEventListener( 'dragover', event => event.preventDefault() );

// отменяем захват картинки, чтобы случайно не дропнуть ее обратно в окно
img.addEventListener('mousedown', event => event.preventDefault() );

menu.addEventListener('click', menuWorker)

// навешиваем события на инпуты, изменяющие цвет рисования
colorInputs.forEach( el => el.addEventListener('change', actualColorChanger ) );

// навешиваем события на инпуты в меню, которые показывают и скрывают комментарии
commentsToggleInputs.forEach( el => {
    if ( el.value === 'on') {
        el.addEventListener('change', commentsShower)
    }
    if (el.value === 'off') {
        el.addEventListener('change', commentsHider)
    }
});

