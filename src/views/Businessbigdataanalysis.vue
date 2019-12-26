<template>
  <div class="Businessbigdataanalysis">
    <div id="analysis_ID" class="analysis_ID"></div>
    <transition
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft"
      :duration="600"
    >
      <div v-show="zoomed" class="analysis_left">
        <p>欠费榜单</p>
        <div class="table">
          <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
              type="index"
              :index="indexMethod"
              label="序号">
            </el-table-column>
            <el-table-column
              prop="name"
              label="县名称">
            </el-table-column>
            <el-table-column
              prop="address"
              label="欠费金额（元）">
            </el-table-column>
          </el-table>
        </div>
        <!-- <el-pagination small class="page" prev-text="上一页" next-text="下一页" layout="prev, pager, next" :total="1"></el-pagination> -->
      </div>
    </transition>
    <transition
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
      :duration="600"
    >
      <div v-show="zoomed" class="analysis_right">
        <div class="analysis_right_top">
          <p>收益榜单</p>
          <div class="table">
            <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
              type="index"
              :index="indexMethod"
              label="序号">
            </el-table-column>
            <el-table-column
              prop="name"
              label="县名称">
            </el-table-column>
            <el-table-column
              prop="address"
              label="收益金额（元）">
            </el-table-column>
          </el-table>
          </div>
          <!-- <el-pagination small class="page" prev-text="上一页" next-text="下一页" layout="prev, pager, next" :total="1"></el-pagination> -->
        </div>
      </div>
    </transition>
    <a :class="zoomed ? 'btn-export' : 'btn-export2'" @click="showCont" style="z-index:300"></a>
    <div :class="[zoomed ? 'label_left' : 'label_right' , 'label']"></div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="460"
      >
      <img :src="imgUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
var stop = null;
var scene = null;
var modelContainer = null;
var modelContainerMainArea = null;
var clickObjects = [];
// var detailClickObjects = [];
// var detailModelContainer = null;
var markPanel = [];
var detailMarkPanel = [];
var renderer = null; //渲染器

import * as THREE from "three"
// eslint-disable-next-line no-unused-vars
import OrbitControls from "three/examples/js/controls/OrbitControls"
// eslint-disable-next-line no-unused-vars
import GLTFLoader from "three/examples/js/loaders/GLTFLoader.js"
import waterdrop from "@/assets/images/waterdrop.png"
import waterdrop2 from "@/assets/images/waterdrop2.png"
import waterdrop3 from "@/assets/images/waterdrop3.png"
import axios from 'axios'
// import { getstore } from '@/utils/uie'
// eslint-disable-next-line no-unused-vars
import animate from "animate.css"
export default {
  name: 'Businessbigdataanalysis',
  props: {
    msg: String
  },
  data() {
    return {
      zoomed: true,
      dialogVisible: false,
      container: null, //容器
      camera: null, //摄像机
      labelRenderer: null,
      orbitControls: null,
      glftScale:0.05,
      glftScaleMainArea: 8,

      cellingMaterial: null,
      slideMaterial: null,
      floorMaterial: null,
      raycaster: null,
      showDetailArea: false,
      areaMap: {},
      imgUrl: require('@/assets/images/播州区.png'),
      tableData: [{
          date: '2016-05-02',
          name: '赫章',
          address: '194345.25',
          address2: '596475.00'
        }, {
          date: '2016-05-04',
          name: '松桃',
          address: '184023.40',
          address2: '579642.40'
        }, {
          date: '2016-05-01',
          name: '万山',
          address: '179985.55',
          address2: '579088.00'
        }, {
          date: '2016-05-03',
          name: '修文',
          address: '155633.25',
          address2: '545453.10'
        },{
          date: '2016-05-02',
          name: '思南',
          address: '140234.20',
          address2: '498734.05'
        }, {
          date: '2016-05-04',
          name: '习水',
          address: '109387.10',
          address2: '478767.00'
        }, {
          date: '2016-05-01',
          name: '关岭',
          address: '64595.00',
          address2: '465434.60'
        }, {
          date: '2016-05-03',
          name: '播州',
          address: '52755.66',
          address2: '461983.75'
        }]
    }
  },
  mounted() {
    this.loadMaterial()
    this.init() 
    this.animate()
  },
  methods: {
    indexMethod(index){
      return index + 1;
    },
    showCont() {
      this.zoomed = !this.zoomed
      // eslint-disable-next-line no-console
      console.log(this.zoomed)
    },
    //加载材质
    loadMaterial() {
      this.cellingMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1e3b });
      this.floorMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1e3b });
      let loader = new THREE.TextureLoader();
      let slideTexture = loader.load("slide.png");
      slideTexture.wrapS = slideTexture.wrapT = THREE.RepeatWrapping;
      slideTexture.repeat.set(1, 1);
      slideTexture.anisotropy = 16;
      this.slideMaterial = new THREE.MeshBasicMaterial({
        map: slideTexture
      });
    },
    //初始化
    init() {
      clickObjects = [];
      markPanel = [];
      // detailClickObjects = [];
      detailMarkPanel = [];
      //容器
      this.container = document.getElementById("analysis_ID");
      this.camera = new THREE.PerspectiveCamera(
        9,
        this.container.clientWidth / this.container.clientHeight,
        1,
        8000
      );
      this.camera.position.set(0, 1000, 1800);
      //场景
      scene = new THREE.Scene();
      //灯光 照射光
      let light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(0, 200, 100);
      light.position.multiplyScalar(1.3);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      let distance = 300;
      light.shadow.camera.left = -distance;
      light.shadow.camera.right = distance;
      light.shadow.camera.top = distance;
      light.shadow.camera.bottom = -distance;
      light.shadow.camera.far = 1000;
     // scene.add(light);
      //渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true ,alpha: true});
      renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.container.appendChild(renderer.domElement);
      //场景控制器
      this.orbitControls = new THREE.OrbitControls(this.camera, renderer.domElement);
      this.orbitControls.maxPolarAngle = Math.PI * 0.5;
      this.orbitControls.minDistance = 1000;
      this.orbitControls.maxDistance = 5000;
      window.addEventListener("resize", this.onWindowResize, false);
      this.container.addEventListener(
        "dblclick",
        this.onMainAreaDbClick,
        false
      );
      
      this.raycaster = new THREE.Raycaster();
      this.loadModel()
    },
    //鼠标双击
    onMainAreaDbClick(event) {
      event.preventDefault();
      var mouse = new THREE.Vector2();
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(mouse, this.camera);
      // eslint-disable-next-line no-console
      var intersects = this.raycaster.intersectObjects(clickObjects);
      if(intersects.length > 0) {
            // 在这里填写点击代码
            // eslint-disable-next-line no-console
            this.imgUrl = ''
            this.dialogVisible = true
            this.$nextTick(() => {
              this.imgUrl = require('@/assets/images/'+intersects[0].object.name+'.png')
            })
        }
    },
    //加载模型
    loadModel() {
      modelContainer = new THREE.Object3D();
      modelContainer.scale.set(this.glftScale, this.glftScale, this.glftScale);
      modelContainer.name = "modelContainer";
      modelContainer.position.set(-23,0,0)
      modelContainerMainArea = new THREE.Object3D();
      modelContainerMainArea.scale.set(this.glftScaleMainArea, this.glftScaleMainArea, this.glftScaleMainArea);
      modelContainer.add(modelContainerMainArea);
      
      scene.add(modelContainer);
      // axios.post('http://192.168.10.23:10001/ba/usersOfWater/V1/getAreaXYTest',{
      //   city_code: "",
      //   area_code: "",
      //   area_name: "",
      //   city_name: "",
      //   flag: "0",
      //   x: "",
      //   y: "",

      // })
      axios.get('gzs.json').then(res=>{
        this.areaMap = res.data;
          // eslint-disable-next-line no-console
        res.data.data.forEach(data => {
          // eslint-disable-next-line no-console
          this.loadModelMark(
            data.area_name,
            new THREE.Vector3(data.x, data.y),
            data.state
          );
            this.loadModelMark2(
            data.area_name,
            new THREE.Vector3(data.x, data.y),
            data.state
          );
        });
        this.loadArea();
      })
    },
    //加载区域
    loadArea(fileName,imgName) {
      let loader = new THREE.GLTFLoader(); /*实例化加载器*/
      // var that = this;
      loader.load(
        "gzs.gltf",
        function(obj) {
          var datalist = []
          var texture2 = null;
          var loader2 = new THREE.TextureLoader();
          for(var i = 0;i<obj.scenes[0].children[0].children.length;i++){
              texture2 = loader2.load((i+1)+".jpg");
              var data = new THREE.MeshBasicMaterial({})
              texture2.repeat.set(1, 1);
              texture2.anisotropy = 16;
              data.map = texture2
              data.transparent = false;
              data.side = THREE.DoubleSide;i
              datalist.push(data)
              // eslint-disable-next-line no-console
              // console.log(obj.scenes[0].children[0].children[i])
              if(datalist.length >= 2){
                obj.scenes[0].children[0].children[i].children[0].material = datalist[i-1]
              }
              if(datalist.length === 9){
                obj.scenes[0].children[0].children[0].children[0].material = datalist[8]
              }
              
              obj.scenes[0].children[0].children[i].children[1].material = datalist[i]
              obj.scenes[0].children[0].children[i].children[1].children[1].material = datalist[i]
              // obj.scenes[0].children[0].children[i].children[1].children[0].material = datalist[i]
              obj.scenes[0].children[0].children[i].children[2].material = datalist[i]
              obj.scenes[0].children[0].children[i].children[2].children[1].material = datalist[i]
              
              if(i !== 0){
                obj.scenes[0].children[0].children[i].children[2].children[0].material = datalist[i]
              }
          }
          // eslint-disable-next-line no-self-assign
          obj.scene.position.x = obj.scene.position.x;
          // eslint-disable-next-line no-self-assign
          obj.scene.position.z = obj.scene.position.z ;
          // eslint-disable-next-line no-self-assign
          obj.scene.position.y = obj.scene.position.y ;
          let loader = new THREE.TextureLoader();
          let texture = loader.load(imgName);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);
          texture.anisotropy = 16;
          let material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0x0000ff,
          });
          material.transparent = false;
          material.side = THREE.DoubleSide;

          // material.position.set(0,1,1)
          // obj.scene.traverse(function(child) {
          //   if (child.name == "celling") {
          //     child.material = material;
          //     child.tag = fileName;
          //     // clickObjects.push(child);
          //   }
          //   if (child.name == "slide") {
          //     child.material = that.slideMaterial;
          //   }
          //   if (child.name == "floor") {
          //     child.material = material;
          //   }
          // });
          // obj.scene.name = fileName;
          modelContainerMainArea.add(obj.scene);
        },
      );
    },
    getTextCanvas(e) {
      var width = 200,
        height = 100;
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, width, height);
      ctx.font = 60 + 'px " bold';
      ctx.fillStyle = '#00a3ea';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e, width / 2, height / 2);
      return canvas;
    },
    //加载标注e
    loadModelMark2(imgName, position,e) {
      // eslint-disable-next-line no-console
      let loader = new THREE.TextureLoader();
      var img
      if(e === '1'){
        img = waterdrop
      }else if(e === '2'){
        img = waterdrop2
      }else{
        img = waterdrop3
      }
      
      let texture = loader.load(img);
      // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.anisotropy = 16;
      let material = new THREE.MeshBasicMaterial({
        map: texture
      });
      material.transparent = true;
      material.side = THREE.DoubleSide;

      let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 200, 1),
        material
      );
      // eslint-disable-next-line no-console
      plane.rotateX(0);
      plane.position.set(position.x, 200, position.y);
      plane.name = imgName
      plane.tag = "tag_";
      modelContainer.add(plane);
      markPanel.push(plane);
      if(e === '2'){
        clickObjects.push(plane)
      }
      return plane;
    },
    loadModelMark(imgName, position,e,data) {
      let material = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(this.getTextCanvas(imgName))
      });
      material.transparent = true;
      material.side = THREE.DoubleSide;

      let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 200, 1),
        material
      );
      // console.log('position-->', position)
      plane.position.set(position.x, 450, position.y);
      plane.tag = "tag_" + imgName;
      plane.name = imgName
      plane.data = data
      if(modelContainer === null){
        return false
      }
      modelContainer.add(plane);
      markPanel.push(plane);
      if(e === '2'){
        clickObjects.push(plane)
      }
      return plane;
    },
    //窗口缩放
    onWindowResize() {
      this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      // renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    animate: function() {
      // console.log(markPanel)
      if(Array.isArray(markPanel) && this.$route.fullPath.startsWith('/Businessbigdataanalysis')){
        // // eslint-disable-next-line no-console
        // console.log(123)
        stop = requestAnimationFrame(this.animate);
        // console.log(this.mapType)
        if (modelContainer && !this.showDetailArea) {
        // modelContainer.rotation.y += 0.002;
        }
        markPanel.forEach(plane => {
          plane.lookAt(this.camera.position);
          plane.rotateX(0);
        });
        detailMarkPanel.forEach(plane => {
          plane.lookAt(this.camera.position);
        });
        renderer.render(scene, this.camera);
      }else{
        window.cancelAnimationFrame(stop);
        stop = null
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='less' scoped>
  .label{
    position: absolute;
    top: 0.3rem;
    width: 3rem;
    height: 0.2rem;
    background: url('~@/assets/images/label.png') no-repeat;
    background-size: 100% 100%;
    transition: right 600ms ease-in-out;
  }
  .label_left{
    right: 4rem;
  }
  .label_right{
    right: 0.3rem;
  }
  .btn-export {
    display: block;
    position: absolute;
    width: .6rem;
    height: .6rem;
    background: url('~@/assets/img/zoomout.png') no-repeat;
    background-size: 100% 100%;
    right: 0.4rem;
    bottom: 0.4rem;
    margin-top: -.3rem;
    z-index: 99;
  }
  .btn-export2 {
    display: block;
    position: absolute;
    width: .6rem;
    height: .6rem;
    background: url('~@/assets/img/zoomin.png') no-repeat;
    background-size: 100% 100%;
    right: 0.4rem;
    bottom: 0.4rem;
    margin-top: -.3rem;
    z-index: 99;
  }
  /deep/ .el-dialog__wrapper{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .el-dialog{
          border: none!important;
          background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAX4AAADzBAMAAABzrWB9AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAYUExURQAAAEdwTDEdkEwu2ksv2TYfm0wt2Ta5/1BkgCMAAAAHdFJOU78Av0Grvzc8q9B1AAAACXBIWXMAAABIAAAASABGyWs+AAABc0lEQVR42u3W7UnDABSF4VCaAS46gWSBIA4QIu0AzQIF3UDJ+taPqtH+UsEeeM4EDxdeuE39/y7nn685A/822/+b85+Df/uH/os5bM3d7WJx/vsmeWt+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn7+b9tl+9d9tn9T0f5uH+1fDRXtnyra3/bZ/rGi/Yd4k/2rTUX7u4r2v8Qb7B8r2r/uo/1v8cb6u4r2t0O2f1fR/vd4M/0f8Wb6Xx+fWP9qqGj/VNH+z/Em+sda+m+C4332PwbHm+efKtrf9tn+saL9X+MN8y8en6P/4SpmU53wz4ddZ2x/wv8EZZn0evNbMUIAAAAASUVORK5CYII=') no-repeat!important;
          background-size: 100% 100%!important;
          z-index: 9999;
          width: 460px;
          height: 295px;
          box-shadow:none;
          margin: 0!important;
          .el-dialog__header{
            display: none;
          }
          .el-dialog__body{
            padding: 0.2rem;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
          }
        }
  .Businessbigdataanalysis{
    height: calc(100vh - 1.5rem);
    position: relative;
    .analysis_ID{
      position: absolute;
      top: -1.11rem;
      left: 0;
      width: 100vw;
      height: calc(100vh - 0.02rem);
      box-sizing: border-box;
    }
    .analysis_left,.analysis_right{
      position: absolute;
      top: 0;
      // height: 100%;
      width: 3.5rem;
      padding: 0.1rem;
      box-sizing: border-box;
      border: 0.02rem solid #233f8b;
      border-radius: 0.06rem;
      background: rgba(1,51,102,.3);
      font-size: 0.16rem;
      p{
        text-align: left;
        color: #fff;
        margin-bottom: 0.1rem;
      }
      .table{
        height: calc(100% - 0.85rem);
        overflow: auto;
        margin-top: 0.1rem;
        /deep/ .el-table, /deep/ .el-table__expanded-cell, /deep/ .el-table th, /deep/ .el-table tr{
          background: none;
        }
        /deep/ .el-table{
          border-left: 1px solid #0077b9;
          border-top: 1px solid #0077b9;
        }
        /deep/ .el-table--border, /deep/ .el-table--group{
          border: none;
          border-top: 1px solid #0077b9;
          border-left: 1px solid #0077b9;
        }
        /deep/ .el-table td,/deep/ .el-table th.is-leaf{
          border-right: 1px solid #0077b9;
          border-bottom: 1px solid #0077b9;
          text-align: center;
          height: 0.45rem!important;
          padding: 0!important;
        }
        /deep/ .el-table th.is-leaf{
          background: #032255;
          // border-bottom: 2px solid #0077b9;
          .cell{
            color: #00a3ea!important;
            font-size: 0.18rem!important;
          }
        }
        /deep/ td .cell{
          color: #fff!important;
          font-size: 0.14rem!important;
        }
        /deep/ .el-table--border::after,/deep/ .el-table--group::after,/deep/ .el-table::before{
          background: none!important;
        }
        /deep/ .el-table--enable-row-hover .el-table__body tr:hover>td{
          background: rgba(#0077b9,0.3);
        }
        .el-table td, .el-table th{
          text-align: center
        }
      }
      .page{
        display: flex;
        justify-content: center;
        position: absolute;
        width: 100%;
        bottom: 0;
        &/deep/ .el-pager li{
          background: transparent;
          color: #fff;
          &.active{
            color: #f9f200;
          }
        }
        &/deep/ button{
          background: transparent;
          color: #fff;
          &.btn-next,&.btn-prev{
            padding-left: 0!important;
            padding-right: 0!important;
            text-align: center;
          }
        }
      }
    }
    .analysis_left{
      left: 0.3rem;
    }
    .analysis_right{
      right: 0.3rem;
    }
  }
</style>
