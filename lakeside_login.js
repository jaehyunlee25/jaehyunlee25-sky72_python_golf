const inputs = document.getElementsByTagName('input');
const ipts = [];
Array.from(inputs).forEach((input) => {
    if(input.type === 'hidden') return;
    if(input.type === 'checkbox') return;
    ipts.push(input);
});
ipts[0].value = 'newrison';
ipts[1].value = 'ilovegolf778';

const btns = document.getElementsByClassName('bt_login');
btns[0].click();