import { SuccessorSet } from './../../models/epistemicmodel/successor-set';
import { environment } from './../../../../../environments/environment';
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Environment } from '../../models/environment/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { World } from '../../models/epistemicmodel/world';

@Component({
  selector: 'app-comics',
  templateUrl: './comics.component.html',
  styleUrls: ['./comics.component.css'],
  encapsulation: ViewEncapsulation.None //because of JQuery dynamics
})


export class ComicsComponent implements OnInit {

  private _env: Environment;
  private perspectiveWorlds: SuccessorSet = undefined;
  @Input() obsEnv: Observable<Environment>;
  @Input() readyObservable: BehaviorSubject<boolean>;
  private ready: boolean;

  constructor() {


    const initGui = () => {
      $('#explanationGUI').css({ top: 150, left: 50 });
      $('#canvasRealWorld').css({ top: 250, left: $('#canvas').width() / 2 - $('#canvasRealWorld').width() / 2 });

      /*to prevent the use of contestmenu (right-click)*/
      /* document.addEventListener("contextmenu", function(e){
         e.preventDefault();
       }, false);*/

      let canvasRealWorld = (<HTMLCanvasElement>$('#canvasRealWorld')[0]);
      console.log('before ready;jakd;flkajl;kfjal;kdjfal;sdkfj;sdlakjf')
      this.readyObservable.subscribe((ready) => {
        console.log(ready);
        if(ready) {
          console.log("ready to be clicked")
          canvasRealWorld.addEventListener("click", (evt) => {
              if (!this.modifyOpenWorldsClick(0, canvasRealWorld, this.env.getEpistemicModel().getPointedWorld())(evt)) {
                let point = this.getMousePos(canvasRealWorld, evt);
                /*console.log(evt.button); // the right button like this does not work
                if(evt.button == 2)
                  this.env.getExampleDescription().onRealWorldClickRightButton(this.env, point);
                else*/
                this.env.getExampleDescription().onRealWorldClick(this.env, point);
                this.drawCanvasWorld();
              }
          });
        }
      });

      canvasRealWorld.addEventListener("contextmenu", (evt) => {

        let point = this.getMousePos(canvasRealWorld, evt);
        console.log("right click : " + point.x + "," + point.y);
        this.env.getExampleDescription().onRealWorldClickRightButton(this.env, point);
        evt.preventDefault();
        this.drawCanvasWorld();
        console.log("Hello this is canva real world")
      });


      $('#canvasBackground').click(() => {
        this.openWorlds = []; this.compute(0);
      });
    }

    setTimeout(this.drawCanvasWorld, 500);
    setTimeout(initGui.bind(this), 500);
  }

  public set env(env: Environment) {
    this._env = env;
    this.compute(0);

  }
  public get env() {
    return this._env;
  }



  ngOnInit() {
    this.obsEnv.subscribe((env) => this.env = env);       //pas bon... pas besoin de compute
  }

  private openWorlds: { world: World, agent: string }[] = [];
  /*
   if openWorld = [], no thoughts are shown
   if openWorld = [{world: "w", agent: "a"}], the real world is w and the GUI shows the thoughts of agent a
   if openWorld = [{world: "w", agent: "a"}, {world: "u", agent: "b"}], then the real world is w, the GUI shows the thouhts of agent a, in which
         there is a possible world u where we show the thoughts of agent b.
  */
  private canvasRealWorldTop = 250;
  private canvasFromWorld: (Map<World, HTMLCanvasElement>)[] = [];
  private readonly canvasWorldStandardWidth = 128;
  private zoomWorldCanvasInBubble = 1.5;
  private levelheight = 170;//this.zoomWorldCanvasInBubble * this.canvasWorldStandardWidth + 40; //170
  private getMaxLevelWidth = () => 480;

  private getYLevelBulle(level: number): number {
    if (this.openWorlds.length == 1 && this.env.getEpistemicModel().getAgents().length == 1) {
      return this.canvasRealWorldTop - level * this.levelheight * 1.4;
    }
    else
      return this.canvasRealWorldTop - level * this.levelheight;
  }



  /**
  @description draw thinking circles (like in comics)
  */
  private drawThinkingCircles(x1: number, y1: number, x2: number, y2: number) {
    /* draw a circle center x, y and radius r */
    function circle(x: number, y: number, r: number) {
      let circleElement = $("<div>");
      circleElement.addClass("bullethought");
      circleElement.css({ left: x - r, width: 2 * r, height: 2 * r, top: y - r });
      $("#canvas-wrap").append(circleElement);
    }

    let yShift = 80;
    y1 += yShift;
    y2 += yShift;
    let pas = 20;
    let imax = (y1 - y2) / pas;

    let y = y1;
    let r = 5;
    for (let i = 0; i <= imax; i++) {
      let x = x1 + (i * (x2 - x1)) / imax;

      if (y - r < y2) return;
      circle(x, y, r);
      y -= pas;
      r += 6;
    }
  }

  /**
  @returns the context object of a canvas (the context is the object on which we can draw)
  */
  private getContext(canvas: HTMLCanvasElement) {
    let context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    let ratio = this.getWorldZoomFactor(canvas);
    context.scale(ratio, ratio);
    return context;
  }

  /**
  @returns the coordinates of element in canvas-wrap
  */
  private cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      top -= element.scrollTop || 0;
      left -= element.scrollLeft || 0;
      element = element.offsetParent;
    } while (element != document.getElementById("canvas-wrap"));

    return { x: left, y: top };
  };


  /**
  @param level level of nesting
  @param worldID ID of a world in the Kripke model
  @returns the coordinates of the world of ID worldID at level
  */
  private getWorldPosition(level: number, world: World) {
    return this.cumulativeOffset(this.canvasFromWorld[level].get(world));
  }

  /**
  @returns a new canvas
  */
  private getNewCanvas(): HTMLCanvasElement {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = "CursorLayer";
    canvas.width = this.canvasWorldStandardWidth * this.zoomWorldCanvasInBubble;
    canvas.height = this.canvasWorldStandardWidth * this.zoomWorldCanvasInBubble / 2;
    canvas.style.zIndex = "8";
    canvas.style.position = "relative";
    canvas.style.margin = "2px 5px 5px 5px";
    canvas.className = "canvasWorld";
    return canvas;
  }



  private getWorldZoomFactor(canvasWorld: HTMLCanvasElement) {
    return canvasWorld.width / this.canvasWorldStandardWidth;
  }




  private getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) / this.getWorldZoomFactor(canvas),
      y: (evt.clientY - rect.top) / this.getWorldZoomFactor(canvas)
    };
  }

  /**
  @param level level of the world
  @param canvasWorld canvas of the world
  @param world the world
  @returns the event that is triggered with clicking on canvasWorld. This event closes all
   levels > level. Then if the user clicks on an agent, it opens her thoughts.
  */
  private modifyOpenWorldsClick(level: number, canvasWorld: HTMLCanvasElement, world: World) {
    let comics = this;
    return function (evt) {
      comics.openWorlds = comics.openWorlds.slice(0, level);
      var point = comics.getMousePos(canvasWorld, evt);
      for (let a of environment.agents)
        if ((canvasWorld.id != "canvasRealWorld") || (comics.env.agentPerspective == undefined) || (a == comics.env.agentPerspective)) {
          if (world.getAgentRectangle(a).isPointIn(point)) {
            comics.openWorlds.push({ world: world, agent: a });
            comics.compute(level);
            return true;
          }
        }
      comics.compute(level);
    }
  }







  /**
  @description make so that DOM element element is shown
  */
  private checkIfInView(element) {
    let parent = element.parent();

    var offset = element.offset().top + parent.scrollTop();

    var height = element.innerHeight();
    var offset_end = offset + height;
    if (!element.is(":visible")) {
      element.css({ "visibility": "hidden" }).show();
      var offset = element.offset().top;
      element.css({ "visibility": "", "display": "" });
    }

    var visible_area_start = parent.scrollTop();
    var visible_area_end = visible_area_start + parent.innerHeight();

    if (offset - height < visible_area_start) {
      parent.animate({ scrollTop: offset - height }, 600);
      return false;
    } else if (offset_end > visible_area_end) {
      parent.animate({ scrollTop: parent.scrollTop() + offset_end - visible_area_end }, 600);
      return false;

    }
    return true;
  }










  /**
  @description make the GUI to show an error
  */
  private guiError() {
    this.openWorlds = [];
    //  graphClear();

    (<any>$('#canvasRealWorld')[0]).draw = () => 0;
    $('#canvasRealWorld').hide();
    $('#explanationGUI').hide();

    this.closeLevelsGreaterThan(0);

    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    if (!canvas)
      return;

    var context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

  }



  /**
  close levels that are strictly greater than fromlevel
  */
  private closeLevelsGreaterThan(level) {
    level++;
    while ($('#level' + level).length > 0) {
      $('#level' + level).remove();
      level++;
    }
  }


  /**
  @param level number of the level
  @description add a <div> to be fullfilled with possible worlds for a given agent
  */
  private addLevelDiv(level: number, successorSet: SuccessorSet) {
    $('#level' + level).remove();

    let levelDiv = $("<div>");
    levelDiv.attr('id', "level" + level);
    levelDiv.addClass("bulle");

    successorSet.getNumber().then((number) => {
     // if (number > 10)
        levelDiv.prepend(`<div class="count">${number} possible worlds</div>`);
    });

    let levelDivContent = $("<div>");
    levelDivContent.attr('id', "level-content" + level);
    levelDivContent.addClass("worldcontainer");
    levelDiv.append(levelDivContent);

    $("#canvas-wrap").append(levelDiv);
  }


  /**
  @param level number of the level
  @param worlds an array of worlds
  @description it fills the GUI level with images of worlds in worlds
  */
  private levelFillWithWorlds(level, successorSet: SuccessorSet) {

    let levelContainer = $('#level-content' + level);

    this.canvasFromWorld[level] = new Map();
    levelContainer.empty();

    successorSet.getNumber().then(
      (number) => {
        if (number == 0)
          $('#level' + level).addClass("error");
        else
          $('#level' + level).removeClass("error");

      }
    )

    let comics = this;
    function callForNewSuccessors() {
      successorSet.getSomeSuccessors().then((succs) => {
        for (let u of succs) {
          if (levelContainer.children().length != 0)
            levelContainer.append('<div class="orBetweenWorlds"> or </div>');


          let canvasWorld = comics.getNewCanvas();

          if (u == comics.openWorlds[level - 1].world)
            $(canvasWorld).addClass("copyRealWorld");
          comics.canvasFromWorld[level].set(u, canvasWorld);
          levelContainer.append(canvasWorld);

          (<any>canvasWorld).draw = () => {
            let context = comics.getContext(canvasWorld);
            u.draw(context);
          };
          (<any>canvasWorld).draw();
          canvasWorld.addEventListener('mouseup',
          comics.modifyOpenWorldsClick(level, canvasWorld, u), false);
          
        }
      });
    }

    callForNewSuccessors();
    levelContainer.on('scroll', function () {
      if (levelContainer.scrollTop() + levelContainer.innerHeight() >= levelContainer[0].scrollHeight) {
        callForNewSuccessors();
      }
    })
  }






  private levelAdjustPosition(x1, level, expectedLevelWidth) {
    let levelWidth = expectedLevelWidth;

    if (levelWidth > this.getMaxLevelWidth())
      levelWidth = this.getMaxLevelWidth();

    let levelLeft = x1 - levelWidth / 2;

    if (levelLeft < 0)
      levelLeft = 0;

    if (levelLeft > $("#canvasBackground").width() - levelWidth)
      levelLeft = $("#canvasBackground").width() - levelWidth;

    $('#level' + level).css({
      left: levelLeft,
      width: levelWidth,
      top: this.getYLevelBulle(level),
    });
  }









  /**
  @param fromlevel
  @description update the GUI
  */
  private compute(fromlevel: number) {
    function getRandomElementInArray(array) { return array[Math.floor(Math.random() * array.length)]; }

    if (this.env.getEpistemicModel().getPointedWorld() == undefined) {
      this.guiError();
      return;
    }

    $('#canvasRealWorld').show();


    if (fromlevel == undefined) {
      this.openWorlds = [];
      fromlevel = 0;
    }

    let shiftY = 0;
    if (this.openWorlds.length > 1)
      shiftY = (this.openWorlds.length - 1) * this.levelheight;

    $("#canvasBackground").css({ top: -shiftY });
    $("#canvas-wrap").animate({ top: shiftY });
    $('#canvasRealWorld').css({ top: 250, left: $('#canvasBackground').width() / 2 - $('#canvasRealWorld').width() / 2 });
    $(".bullethought").remove();

    if (this.openWorlds.length > 0)
      $('#explanationGUI').hide();


    if (fromlevel == 0) {
      let canvas = $('#canvasRealWorld')[0];
      this.canvasFromWorld[0] = new Map();
      this.canvasFromWorld[0].set(this.env.getEpistemicModel().getPointedWorld(), <HTMLCanvasElement>canvas);
      (<any>canvas).draw = () => {
        let context = this.getContext((<HTMLCanvasElement>document.getElementById("canvasRealWorld")));

        if (this.env.agentPerspective != undefined) {
          let comics = this;
          let M = comics.env.getEpistemicModel();
          this.perspectiveWorlds = M.getSuccessors(M.getPointedWorld(), comics.env.agentPerspective);
          let loop = function () {
            comics.perspectiveWorlds.getRandomSuccessor().then((world) => {
              if ((comics.env.agentPerspective != undefined))
                world.draw(context)
            });
            if ((comics.env.agentPerspective != undefined))
              setTimeout(loop, 500);
          }
          loop();
        }
        else
          this.env.getEpistemicModel().getPointedWorld().draw(context);
      }


    }

    this.closeLevelsGreaterThan(fromlevel);

    var level = 0;
    for (let worldagent of this.openWorlds) {
      level++;

      var u = worldagent.world;


      var y = this.getYLevelBulle(level);
      var x1 = this.getWorldPosition(level - 1, u).x;
      var y1 = this.getWorldPosition(level - 1, u).y;

      let factor = this.getWorldZoomFactor(this.canvasFromWorld[level - 1].get(u));
      x1 += factor * (u.getAgentRectangle(worldagent.agent).x1
        + u.getAgentRectangle(worldagent.agent).w / 2);

      y1 += factor * (u.getAgentRectangle(worldagent.agent).y1
        + u.getAgentRectangle(worldagent.agent).h / 2) - 96;

      this.drawThinkingCircles(x1, y1, x1, y);

      if (level > fromlevel) {
        let successors = this.env.getEpistemicModel().getSuccessors(worldagent.world, worldagent.agent);
        this.addLevelDiv(level, successors);
        this.levelFillWithWorlds(level, successors);
        this.levelAdjustPosition(x1, level, 20 * this.getCanvasWorldInBubbleWidth() + 64); //FIX ME
      }
      //    else
      //      $('#level' + level).css({top: getYLevelBulle(level)});

    }
    this.drawCanvasWorld();

  }






  private getCanvasWorldInBubbleWidth() {
    return this.canvasWorldStandardWidth * this.zoomWorldCanvasInBubble;
  }







  private drawCanvasWorld() {
    $(".canvasWorld").each(function () {
      let canvas = <HTMLCanvasElement>this;
      let context = canvas.getContext('2d');

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(80 + 64, 0);
      context.lineTo(80 + 64 + 16, 64);
      context.lineTo(-16, 64);
      context.clearRect(0, 0, canvas.width, canvas.height);

      if ((<any>canvas).draw != undefined)
        (<any>canvas).draw(this);
    });
  }

}
