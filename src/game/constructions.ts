
import dropRepeats from 'xstream/extra/dropRepeats';

import { getDysonAmount } from './api';
import { updateTimer$ } from '../lib/update-timer';

export const dysonSectionsAmount$ = updateTimer$
  .map(() => getDysonAmount())
  .compose(dropRepeats())
  .remember()
