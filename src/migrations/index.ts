import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20261006_154441_content_model from './20261006_154441_content_model';

export const migrations = [
  {
    up: migration_20260918_151419_initial.up,
    down: migration_20260918_151419_initial.down,
    name: '20260918_151419_initial',
  },
  {
    up: migration_20261006_154441_content_model.up,
    down: migration_20261006_154441_content_model.down,
    name: '20261006_154441_content_model'
  },
];
