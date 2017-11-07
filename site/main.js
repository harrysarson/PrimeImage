import imageLoad from './scripts/image-load.js';


const pages = [
  imageLoad
];



const displays = document.querySelectorAll('.display-panel');
const changeStageButtons = document.querySelectorAll('[data-stage-change]');

const interaction = document.getElementById('interaction');

imageLoad({
  input: interaction.querySelector('.interaction-interface').children[1],
  output: displays[0].children[1],
});

let state = updateStage({
  currentStage: 0,
  selectedElements: new Set(),
}, 0);

function buttonGoesBack(button) {
  return {}.hasOwnProperty.call(button.dataset, 'stageChange') && button.dataset.stageChange < 0;
}

function updateStage(state, newStage) {

  if (newStage < 0) {
    throw new Error('Cannot set negative stage');
  }

  const newState = Object.assign({}, state, { currentStage: newStage });

  for (const oldSelectedElement of state.selectedElements) {
    oldSelectedElement.classList.remove('current-stage');
  }

  newState.selectedElements = new Set();

  for (const container of document.getElementsByClassName('stage-selecting')) {
      container
        .style
        .setProperty('--show-stage', newStage);

      const newSelectedElement = container.children[newStage];
      if (newSelectedElement != null) {
        newSelectedElement.classList.add('current-stage');
        newState.selectedElements.add(newSelectedElement);
      }
  }
  if (newStage === 0) {
    for (const button of changeStageButtons) {
      if (buttonGoesBack(button)) {
        button.setAttribute('disabled', '');
      }
    }
  } else {
    for (const button of changeStageButtons) {
      if (buttonGoesBack(button)) {
        button.removeAttribute('disabled', '');
      }
    }
  }

  return newState;
}

function moveStage(amount = 1) {
  const oldStage = state.currentStage;
  const newStage = Math.max(0, oldStage + amount);

  if (oldStage === newStage) return;

  state = updateStage(state, newStage);
}


for (const button of changeStageButtons) {
  button.addEventListener('click', (e) => {

    const stageChange = +button.dataset.stageChange;

    if (Number.isNaN(stageChange) || stageChange % 1 !== 0) {
      throw new Error(`Element ${button}'s "data-stage-change" property must be an integer`)
    }

    moveStage(stageChange);
  });
}
