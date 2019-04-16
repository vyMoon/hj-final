const apiURL = 'https://neto-api.herokuapp.com';

const app = finder('.app');

// меню и его элементы
const menu = finder('.menu'); 
const menuBurger = finder('.burger', menu);
const menuNew = finder('.new', menu);
const menuComments = finder('.comments', menu);
const menuCommentsTools = finder('.comments-tools', menu);
const menuDraw = finder('.draw', menu);
const menuDrawTools = finder('.draw-tools', menu);
const menuShare = finder('.share', menu);
const menuShareTools = finder('.share-tools', menu);
const menuShareUrl = finder('.menu__url', menuShareTools);
const menuShareCopyButton = finder('.menu_copy', menuShareTools);

// вспомогательные переменные для перетаскивания меню
let moved;
let shiftX = 0;
let shiftY = 0;

// картинка и ошибки при работе скартинуой
const img = finder('.current-image');           // слой с картинкой
let imgSrc = false;                             // нужна для того чтобы показывать ошибку при дропе на имеющееся изображение
const imgTypeError = finder('.error');          // контейнер с ошибкой при загрузке не файла не верного типа
const imgLoader = finder('.image-loader');      // отображается при загрузке картинки

// хоолст
const doodle = elementMaker('canvas', 'canvas');
app.insertBefore(doodle, img.nextElementSibling);
const ctx = doodle.getContext("2d");

// маска
const mask = elementMaker('img', 'mask');
app.insertBefore(mask, doodle);

// переменные для рисования
const BRUSH_RADIUS = 4;
let curves = [];
let drawing = false;
let needsRepaint = false;
let needsSend = false;

// контейнер для инпута который будет загружать изображение
const inputContainer = document.createElement('div');
inputContainer.classList.add('inputContainer');

const colorInputs = finderAll('.menu__color', menuDrawTools );  // инпуты для смены цвета рисования

const paintingColors = {    // доступные цвета
    red: '#ea5d56',
    yellow: '#f3d135',
    green: '#6cbe47',
    blue: '#53a7f5',
    purple: '#b36ade'
};

// активный цвет рисования
// ищем инпут, который  чекнут по умолчанию и присваиваем переменной код выбранного цвета
let actualColor = paintingColors[ colorInputs.find( el => {return el.hasAttribute('checked')} ).value ];

//инпуты, скрывающие - показывающие комментарии
const commentsToggleInputs = finderAll('.menu__toggle', menuCommentsTools);

const commentsForm = finder('.comments__form');
const commentsContainer = document.createElement('div');
commentsContainer.classList.add('commentsContainer');
commentsContainer.style.position = 'relative';
app.insertBefore(commentsContainer, doodle.nextElementSibling);
