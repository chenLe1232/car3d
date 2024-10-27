import Buff from '../../framework3D/misc/buffs/Buff';
import PlayerCar from '../PlayerCar';
import { Vec3, director, ISchedulable, isValid } from 'cc';
import GridMap1D from '../Common/GridX/GridMap1D';
import Level from '../Scenes/Level';
import { Grid3D } from '../Common/GridX/Grid3D';
import Magnet from '../Magnet';

export default class Buff_Magnet extends Buff implements ISchedulable {
  id: string = 'Buff_Magnet';

  stars: Node[] = [];
  map: GridMap1D = null;
  car: PlayerCar = null;

  public onEnabled() {
    this.car = Level.instance.car;
    this.map = Level.instance.map;
    this.car.magnetEnabled = true;
    director.getScheduler().schedule(this.update, this, 0.1);
    // Root.instance.magnet.active = true;
  }

  public onDisabled() {
    this.car.magnetEnabled = false;
    director.getScheduler().unschedule(this.update, this);
    this.car == null;
    // Root.instance.magnet.active = false;
  }

  onTimeLeftChanged() {}

  update() {
    if (!isValid(this.car)) return;
    //check stars around me
    let carpos = this.car.node.position;
    let grids = this.map.whichGrids(carpos.z, 0, 2);
    //add magnet on stars
    grids.forEach(v => this.checkGrid(v));
  }

  checkGrid(grid: Grid3D) {
    if (grid != null) {
      let children = grid.container.children;
      for (let i = 0; i < children.length; i++) {
        // check stars 只吸钻石
        let star = children[i];
        if (star.name == 'Diamond') {
          let starWorldPos = grid.convertToWorldPosition(star.position);
          // if (Vec3.squaredDistance(starWorldPos, this.car.node.position) < 40000) {
          if (starWorldPos.z - this.car.node.position.z < 600) {
            let magnet = star.getComponent(Magnet);
            if (!magnet) {
              magnet = star.addComponent(Magnet);
            }
          }
        }
      }
    }
  }
}
