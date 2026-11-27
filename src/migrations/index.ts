import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20261006_154441_content_model from './20261006_154441_content_model';
import * as migration_20261006_200758_donate_link from './20261006_200758_donate_link';
import * as migration_20261006_215900_page_photo_size from './20261006_215900_page_photo_size';
import * as migration_20261006_220000_system_pages from './20261006_220000_system_pages';
import * as migration_20261007_133341_map_link_default from './20261007_133341_map_link_default';
import * as migration_20261007_140000_fix_map_link from './20261007_140000_fix_map_link';
import * as migration_20261116_210021_board_todo_list from './20261116_210021_board_todo_list';
import * as migration_20261127_220000_parking_map from './20261127_220000_parking_map';

export const migrations = [
  {
    up: migration_20260918_151419_initial.up,
    down: migration_20260918_151419_initial.down,
    name: '20260918_151419_initial',
  },
  {
    up: migration_20261006_154441_content_model.up,
    down: migration_20261006_154441_content_model.down,
    name: '20261006_154441_content_model',
  },
  {
    up: migration_20261006_200758_donate_link.up,
    down: migration_20261006_200758_donate_link.down,
    name: '20261006_200758_donate_link',
  },
  {
    up: migration_20261006_215900_page_photo_size.up,
    down: migration_20261006_215900_page_photo_size.down,
    name: '20261006_215900_page_photo_size',
  },
  {
    up: migration_20261006_220000_system_pages.up,
    down: migration_20261006_220000_system_pages.down,
    name: '20261006_220000_system_pages',
  },
  {
    up: migration_20261007_133341_map_link_default.up,
    down: migration_20261007_133341_map_link_default.down,
    name: '20261007_133341_map_link_default',
  },
  {
    up: migration_20261007_140000_fix_map_link.up,
    down: migration_20261007_140000_fix_map_link.down,
    name: '20261007_140000_fix_map_link',
  },
  {
    up: migration_20261116_210021_board_todo_list.up,
    down: migration_20261116_210021_board_todo_list.down,
    name: '20261116_210021_board_todo_list'
  },
  {
    up: migration_20261127_220000_parking_map.up,
    down: migration_20261127_220000_parking_map.down,
    name: '20261127_220000_parking_map',
  },
];
