import { computed, ComputedRef, Ref, ref } from 'vue';
import { pluralize } from './pluralize.js';

interface Timer {
  seconds: Ref<number>;
  label: ComputedRef<string>;
  start: () => void;
  stop: () => void;
}

export const useTimer = (cooldown: number): Timer => {
  const seconds = ref<number>(0);
  const label = computed<string>(() => pluralize(seconds.value, ['секунду', 'секунды', 'секунд']));

  let timerInterval: number;

  const start = () => {
    clearInterval(timerInterval);

    seconds.value = cooldown;
    timerInterval = setInterval(() => {
      seconds.value -= 1;

      if (seconds.value === 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  const stop = (): void => {
    clearInterval(timerInterval);
  };

  return {
    seconds,
    label,
    start,
    stop,
  };
};
