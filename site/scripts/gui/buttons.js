import { creators as actionCreators } from '../actions/index.js';
import Iterable from '../lib/Iterable.js';

const { Rx } = window;

const { setAttribute, removeAttribute } = Element.prototype;

const attibuteUpdater = $elements =>
  function setDisabledAttribute(shouldDisable) {
    const toggleAttribute = shouldDisable ? setAttribute : removeAttribute;

    for (const $element of $elements) {
      toggleAttribute.call($element, 'disabled', '');
    }
  };


/**
 * Creates GUI for buttons that change the current stage.
 *
 * @param {object} args
 * @param {Element} args.attributename Name of HTML attribute defining the button.
 * @param {number} maxStage Index of maximum stage.
 *
 * @returns Object allowing buttons to be observed and updated.
 */
export default ({ attributename, maxStage }) => {
  const {
    tap, map, startWith, distinctUntilChanged,
  } = Rx.operators;

  return Object.freeze({
    /**
     * Observe all buttons in `$input` for required changes in stage.
     *
     * @param {Element} $input Element to observe buttons within.
     * @returns Observable Subscribe to recieve move stage actions.
     */
    observable($input) {
      return Rx.Observable.fromEvent($input, 'click')
        .filter(event => event.target.hasAttribute(attributename))
        .map((event) => {
          const stageChange = +event.target.getAttribute(attributename);

          if (Number.isNaN(stageChange) || stageChange % 1 !== 0) {
            throw new Error(`Element ${event.target}'s "attributename" property must be an integer`);
          }

          return stageChange;
        })
        .map(actionCreators.moveStage);
    },

    /**
     * Observe all buttons in `$input` for required changes in stage.
     *
     * @param {Element} Element to update buttons within.
     * @returns {function(source: Observable): Observable} rxjs operator which updates buttons.
     */
    updater($output) {
      const $elements = new Iterable(function* getElements() {
        yield* $output.querySelectorAll(`[${attributename}]`);
      });

      return (source) => {
        const backButtons = source.pipe(
          map(stage => (stage <= 0)),
          startWith(false),
          distinctUntilChanged(),
          tap(attibuteUpdater($elements.filter(button => button.getAttribute(attributename) < 0))),
        );

        const forwardButtons = source.pipe(
          map(stage => (stage >= maxStage)),
          startWith(false),
          distinctUntilChanged(),
          tap(attibuteUpdater($elements.filter(button => button.getAttribute(attributename) > 0))),
        );

        return Rx.Observable.merge(backButtons, forwardButtons);
      };
    },
  });
};
