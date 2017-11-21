import imageLoad from './scripts/image-load.js';
import createStore from './scripts/store/create.js';

import createButtons from './scripts/gui/buttons.js';
import { creators as action_creators } from './scripts/actions/index.js';

const pages = [
  imageLoad
];

const store = createStore();

const displays = document.querySelectorAll('.display-panel');

const interaction = document.getElementById('interaction');

const configuration = {
  stage_count: 2,
};

createButtons({
  $root: document,
  attributename: 'stage-change',
  stage_count: configuration.stage_count,
  store,
});

imageLoad({
  input: interaction.querySelector('.interaction-interface').children[1],
  output: displays[0].children[1],
});


function buttonGoesBack(button) {
  return {}.hasOwnProperty.call(button.dataset, 'stageChange') && button.dataset.stageChange < 0;
}


store.subscribe(function() {

  for (const oldSelectedElement of document.getElementsByClassName('current-stage')) {
    oldSelectedElement.classList.remove('current-stage');
  }

  const newStage = store.getState().get('current_stage');

  for (const container of document.getElementsByClassName('stage-selecting')) {
      container
        .style
        .setProperty('--show-stage', newStage);

      const newSelectedElement = container.children[newStage];
      if (newSelectedElement != null) {
        newSelectedElement.classList.add('current-stage');
      }
  }

});


