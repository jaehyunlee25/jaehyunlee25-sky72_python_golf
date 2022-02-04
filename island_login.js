const inputs = document.getElementsByTagName('input');
const ipts = [];
Array.from(inputs).forEach((input) => {
    if(input.type === 'hidden') return;
    ipts.push(input);
});
ipts[0].value = 'newrison';
ipts[1].value = 'ilovegolf778';

Data_Save();