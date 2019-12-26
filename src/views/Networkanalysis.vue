<template>
  <div class="Networkanalysis">
    <div id="analysis_ID" class="analysis_ID"></div>
    <transition
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft"
      :duration="600"
    >
      <div v-show="zoomed" class="analysis_left">
        <p>漏损排行榜</p>
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
              label="镇名称">
            </el-table-column>
            <el-table-column
              prop="address"
              label="漏损率">
            </el-table-column>
          </el-table>
        </div>
        <!-- <el-pagination small class="page" prev-text="上一页" next-text="下一页" layout="prev, pager, next" :total="1"></el-pagination> -->
      </div>
    </transition>
    <a :class="zoomed ? 'btn-export' : 'btn-export2'" @click="showCont" style="z-index:300"></a>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      >
      <div class="innerVisible_box">
        <el-dialog
          width="80%"
          :visible.sync="innerVisible"
          custom-class = "nimei"
          append-to-body>
          <div v-if="ISecharts === 1" ref="line_box" style="width: 100%;height: 5rem"></div>
          <div v-if="ISecharts === 2" ref="line_box2" style="width: 100%;height: 5rem"></div>
        </el-dialog>
      </div>
      <p class="dialog_hint"><span class="lf">{{popUatat.CITYTWON+'('+popUatat.area_code+')'}}</span><span class="rt">{{day}}</span></p>
      <div class="dialog_center">
        <p class="text"><span class="lf">正向累计流量</span><span class="rt">28012082吨</span></p>
        <p class="text"><span class="lf">反向累计流量</span><span class="rt">28012082吨</span></p>
        <p class="text"><span class="lf">瞬时流量</span><span class="rt">0.2吨/小时 <i @click="getline()"></i></span></p>
        <p class="text"><span class="lf">压力</span><span class="rt">0.62MPa <i @click="gteline2()"></i></span></p>
        <p class="text"><span class="lf">最后采集时间</span><span class="rt">{{day}}</span></p>
      </div>
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
// import waterdrop from "@/assets/images/waterdrop.png"
import waterdrop2 from "@/assets/images/waterdrop2.png"
// import waterdrop3 from "@/assets/images/waterdrop3.png"
import axios from 'axios'
// eslint-disable-next-line no-unused-vars
import animate from "animate.css"
var echarts = require("echarts/lib/echarts");
// 引入折线图
// 引入折线图
require("echarts/lib/chart/line");
require("echarts/lib/chart/radar");
require("echarts/lib/chart/bar");
require("echarts/lib/chart/funnel");
require("echarts/lib/component/timeline");
require("echarts/lib/component/title");
require("echarts/lib/component/graphic");
require("echarts/lib/component/legend");
require("echarts/lib/component/tooltip");
require('echarts/lib/component/dataZoom');
export default {
  name: 'Networkanalysis',
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
      innerVisible: false,
      cellingMaterial: null,
      slideMaterial: null,
      floorMaterial: null,
      raycaster: null,
      showDetailArea: false,
      areaMap: {},
      imgUrl: '',
      day: '',
      ISecharts: 1,
      popUatat: {},
      tableData: [{
          date: '2016-05-02',
          name: '龙田',
          address: '26.54%'
        }, {
          date: '2016-05-04',
          name: '注溪',
          address: '23.45%'
        }, {
          date: '2016-05-01',
          name: '客楼',
          address: '20.5%'
        }, {
          date: '2016-05-03',
          name: '天马',
          address: '18.3%'
        },{
          date: '2016-05-02',
          name: '羊桥',
          address: '17.4%'
        }, {
          date: '2016-05-04',
          name: '水尾',
          address: '15.55%'
        }, {
          date: '2016-05-01',
          name: '天星',
          address: '13.3%'
        }, {
          date: '2016-05-03',
          name: '凯本',
          address: '12.56%'
        },{
          date: '2016-05-03',
          name: '平庄',
          address: '12.45%'
        },{
          date: '2016-05-03',
          name: '大有',
          address: '11.5%'
        }]
    }
  },
  mounted() {
    this.loadMaterial()
    this.init() 
    this.animate()
    var day2 = new Date();
        day2.setTime(day2.getTime());
    this.day = day2.getFullYear()+"-" + (day2.getMonth()+1) + "-" + day2.getDate();
  },
  methods: {
    gteline2(){
      this.ISecharts = 2
      this.innerVisible = true
      var that = this
      this.$nextTick(() => {
        // setTimeout(function (){
        // eslint-disable-next-line no-console
      let el = echarts.init(that.$refs.line_box2);
      var option = {
          grid: {
              left: '50px',
              right: '20px',
              top: '20%',
              bottom: '25%'
          },
          title: {
            text: '近三天数据环比',
            textStyle: {
              color: '#fff'
            }
          },
          tooltip : {
            trigger: 'axis',
          },
          legend: {
            data:['2019/12/24','2019/12/25','2019/12/26'],
            textStyle:{
              color: '#ffffff'//字体颜色
            },
          },
          toolbox: {
            show : true,
            feature : {
              mark : {show: true},
              dataZoom : {show: true},
              dataView : {show: true},
              magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
              restore : {show: true},
              saveAsImage : {show: true}
            }
          },
          calculable : true,
          dataZoom : {
            show : true,
            realtime : true,
            start : 20,
            end : 80,
            textStyle:{
              color: '#ffffff'//字体颜色
            },
          },
          xAxis : [{
            type : 'category',
            boundaryGap : false,
            axisLabel: {
              show: true,
              textStyle: {
                  color: '#fff'
              },
            },
            axisLine: {
              lineStyle: {
                color: '#fff'
              }
            },
            data : function (){
              var list = ['00:00', '00:10', '00:20', '00:30', '00:40', '00:50',
                '01:00', '01:10', '01:20', '01:30', '01:40', '01:50',
                '02:00', '02:10', '02:20', '02:30', '02:40', '02:50',
                '03:00', '03:10', '03:20', '03:30', '03:40', '03:50',
                '04:00', '04:10', '04:20', '04:30', '04:40', '04:50',
                '05:00', '05:10', '05:20', '05:30', '05:40', '05:50',
                '06:00', '06:10', '06:20', '06:30', '06:40', '06:50',
                '07:00', '07:10', '07:20', '07:30', '07:40', '07:50',
                '08:00', '08:10', '08:20', '08:30', '08:40', '08:50',
                '09:00', '09:10', '09:20', '09:30', '09:40', '09:50',
                '10:00', '10:10', '10:20', '10:30', '10:40', '10:50',
                '11:00', '11:10', '11:20', '11:30', '11:40', '11:50',
                '12:00', '12:10', '12:20', '12:30', '12:40', '12:50',
                '13:00', '13:10', '13:20', '13:30', '13:40', '13:50',
                '14:00', '14:10', '14:20', '14:30', '14:40', '14:50',
                '15:00', '15:10', '15:20', '15:30', '15:40', '15:50',
                '16:00', '16:10', '16:20', '16:30', '16:40', '16:50',
                '17:00', '17:10', '17:20', '17:30', '17:40', '17:50',
                '18:00', '18:10', '18:20', '18:30', '18:40', '18:50',
                '19:00', '19:10', '19:20', '19:30', '19:40', '19:50',
                '20:00', '20:10', '20:20', '20:30', '20:40', '20:50',
                '21:00', '21:10', '21:20', '21:30', '21:40', '21:50',
                '22:00', '22:10', '22:20', '22:30', '22:40', '22:50',
                '23:00', '23:10', '23:20', '23:30', '23:40', '23:50'
              ];    
              return list;
              }()
            }
          ],
          yAxis : [
            {
              type : 'value',
              axisLabel: {
                show: true,
                textStyle: {
                  color: '#fff'
                },
              },
              axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
            }
          ],
          series : [{
            symbol: "none",
            name:'2019/12/24',
            type:'line',
            data:function (){
              var list = [];
              for (var i = 1; i <= 144; i++) {
                  list.push(0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.21,0.19,0.19,0.19,0.2,0.19,0.19,0.2,0.2,0.19,0.19,0.19,0.19,0.19,0.2,0.19,0.2,0.2,0.2,0.19,0.2,0.19,0.19,0.21,0.2,0.21,0.21,0.21,0.2,0.2,0.2,0.21,0.21,0.19,0.2,0.2,0.2,0.21,0.2,0.2,0.17,0.2,0.21,0.21,0.2,0.2,0.21,0.21,0.2,0.21,0.2,0.2,0.21,0.22,0.22,0.21,0.19,0.19,0.2,0.21,0.2,0.2,0.19,0.22,0.2,0.2,0.21,0.2,0.21,0.21,0.21,0.2,0.21,0.21,0.22,0.21,0.21,0.21,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.21,0.2,0.21,0.23,0.22,0.21,0.22,0.22,0.21,0.22,0.23,0.22,0.21,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.23,0.22,0.23,0.21,0.21,0.22,0.21,0.22,0.2,0.21,0.2,0.21,0.2,0.21,0.21,0.21,0.21,0.22);
              }
              return list;
            }(),
              itemStyle: {
                normal: {
                  lineStyle:{
                    width: 1//设置线条粗细
                  }
                }
              },
              markPoint: {
                data: [
                  {type: 'max', name: '最大值'},
                  {type: 'min', name: '最小值'}
                ]
              }
              ,markLine: {
                  data: [
                    {type: 'average', name: '平均值'}
                  ]
                }
              },
              {
                symbol: "none",
                name:'2019/12/25',
                type:'line',
                data:function (){
                  var list = [];
                  for (var i = 1; i <= 144; i++) {
                    list.push(0.2,0.21,0.21,0.21,0.21,0.22,0.22,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.22,0.22,0.2,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.22,0.19,0.2,0.19,0.21,0.2,0.2,0.21,0.21,0.2,0.2,0.2,0.2,0.21,0.21,0.19,0.21,0.2,0.21,0.2,0.21,0.21,0.2,0.21,0.22,0.21,0.2,0.19,0.21,0.21,0.2,0.21,0.2,0.22,0.2,0.2,0.2,0.21,0.21,0.22,0.21,0.21,0.2,0.2,0.21,0.21,0.22,0.19,0.21,0.21,0.22,0.19,0.21,0.21,0.21,0.21,0.22,0.22,0.21,0.22,0.22,0.22,0.21,0.21,0.22,0.22,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.22,0.21,0.22,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.21,0.22,0.22,0.22,0.22,0.22,0.2,0.21,0.2,0.22,0.21,0.21,0.2,0.21,0.22,0.22,0.2,0.21,0.21,0.2,0.23,0.22);
                  }
                  return list;
                }(),
                itemStyle: {
                  normal: {
                    lineStyle:{
                      width: 1//设置线条粗细
                    }
                  }
                },
                markPoint: {
                  data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                  ]
                }
                ,markLine: {
                  data: [
                    {type: 'average', name: '平均值'}
                  ]
                }
              },
              {
                symbol: "none",
                name:'2019/12/26',
                type:'line',
                data:function (){
                  var list = [];
                  for (var i = 1; i <= 144; i++) {
                    list.push(0.19,0.21,0.21,0.22,0.22,0.22,0.22,0.2,0.2,0.22,0.19,0.21,0.21,0.21,0.21,0.21,0.23,0.21,0.2,0.22,0.22,0.23,0.21,0.21,0.2,0.23,0.2,0.21,0.19,0.2,0.2,0.2,0.21,0.21,0.22,0.22,0.2,0.21,0.19,0.2,0.2,0.2,0.21,0.21,0.21,0.21,0.21,0.22,0.2,0.22,0.21,0.2,0.19,0.21,0.21,0.21,0.21,0.21,0.21,0.22,0.21,0.2,0.2,0.2,0.19,0.19,0.22,0.22,0.21,0.2,0.2,0.2,0.2,0.2,0.22,0.22,0.22,0.21,0.2,0.2,0.2,0.21,0.22,0.22,0.19,0.19,0.2,0.2,0.19,0.21,0.21,0.22,0.22,0.22,0.22,0.21,0.2,0.2,0.2,0.1,0.1,0.2,0.21,0.21,0.21,0.21,0.2,0.2,0.2,0.21,0.2,0.22,0.21,0.22,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.21,0.22,0.22,0.22,0.22,0.22,0.2,0.21,0.2,0.22,0.21,0.21,0.2,0.21,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.22);
                  }
                  return list;
                }(),
                itemStyle: {
                  normal: {
                    lineStyle:{
                      width:1//设置线条粗细
                    }
                  }
                },
                markPoint: {
                  data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                  ]
                }
                ,markLine: {
                  data: [
                    {type: 'average', name: '平均值'}
                  ]
                }
              }
            ]
          };
        el.setOption(option);
      })
    },
    getline(){
      this.ISecharts = 1
      this.innerVisible = true
      var that = this
      this.$nextTick(() => {
        // setTimeout(function (){
        // eslint-disable-next-line no-console
      let el = echarts.init(that.$refs.line_box);
      var option = {
          grid: {
              left: '50px',
              right: '20px',
              top: '20%',
              bottom: '25%'
          },
          title: {
            text: '近三天数据环比',
            textStyle: {
              color: '#fff'
            }
          },
          tooltip : {
              trigger: 'axis'
          },
          legend: {
            data:['2019/12/24','2019/12/25','2019/12/26','平均线'],
            textStyle:{
              color: '#ffffff'//字体颜色
            },
          },
          toolbox: {
            show : true,
            feature : {
              mark : {show: true},
              dataZoom : {show: true},
              dataView : {show: true},
              magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
              restore : {show: true},
              saveAsImage : {show: true}
            }
          },
          calculable : true,
          dataZoom: [
            {
              show: true,
              realtime: true,
              start: 65,
              end: 85,
              textStyle:{
                color: '#ffffff'//字体颜色
              },
            },
            {
              type: 'inside',
              realtime: true,
              start: 65,
              end: 85,
              textStyle:{
                color: '#ffffff'//字体颜色
              },
            }
          ],
          xAxis : [
            {
              type : 'category',
              boundaryGap : false,
              axisLabel: {
                show: true,
                textStyle: {
                    color: '#fff'
                },
              },
              axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
              data : function (){
                var list = ['00:00', '00:10', '00:20', '00:30', '00:40', '00:50',
                            '01:00', '01:10', '01:20', '01:30', '01:40', '01:50',
                            '02:00', '02:10', '02:20', '02:30', '02:40', '02:50',
                            '03:00', '03:10', '03:20', '03:30', '03:40', '03:50',
                            '04:00', '04:10', '04:20', '04:30', '04:40', '04:50',
                            '05:00', '05:10', '05:20', '05:30', '05:40', '05:50',
                            '06:00', '06:10', '06:20', '06:30', '06:40', '06:50',
                            '07:00', '07:10', '07:20', '07:30', '07:40', '07:50',
                            '08:00', '08:10', '08:20', '08:30', '08:40', '08:50',
                            '09:00', '09:10', '09:20', '09:30', '09:40', '09:50',
                            '10:00', '10:10', '10:20', '10:30', '10:40', '10:50',
                            '11:00', '11:10', '11:20', '11:30', '11:40', '11:50',
                            '12:00', '12:10', '12:20', '12:30', '12:40', '12:50',
                            '13:00', '13:10', '13:20', '13:30', '13:40', '13:50',
                            '14:00', '14:10', '14:20', '14:30', '14:40', '14:50',
                            '15:00', '15:10', '15:20', '15:30', '15:40', '15:50',
                            '16:00', '16:10', '16:20', '16:30', '16:40', '16:50',
                            '17:00', '17:10', '17:20', '17:30', '17:40', '17:50',
                            '18:00', '18:10', '18:20', '18:30', '18:40', '18:50',
                            '19:00', '19:10', '19:20', '19:30', '19:40', '19:50',
                            '20:00', '20:10', '20:20', '20:30', '20:40', '20:50',
                            '21:00', '21:10', '21:20', '21:30', '21:40', '21:50',
                            '22:00', '22:10', '22:20', '22:30', '22:40', '22:50',
                            '23:00', '23:10', '23:20', '23:30', '23:40', '23:50'
                            ];
                return list;
              }()
            }
          ],
          yAxis : [
            {
              type : 'value',
              axisLabel: {
                show: true,
                textStyle: {
                  color: '#fff'
                }
              },
              axisLine: {
                lineStyle: {
                  color: '#fff'
                }
              },
            }
          ],
          series : [
            {
              symbol: "none",
                name:'2019/12/24',
                type:'line',
                data:function (){
                    var list = [];
                    for (var i = 1; i <= 144; i++) {
                        list.push(0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.21,0.19,0.19,0.19,0.2,0.19,0.19,0.2,0.2,0.19,0.19,0.19,0.19,0.19,0.2,0.19,0.2,0.2,0.2,0.19,0.2,0.19,0.19,0.21,0.2,0.21,0.21,0.21,0.2,0.2,0.2,0.21,0.21,0.19,0.2,0.2,0.2,0.21,0.2,0.2,0.17,0.2,0.21,0.21,0.2,0.2,0.21,0.21,0.2,0.21,0.2,0.2,0.21,0.22,0.22,0.21,0.19,0.19,0.2,0.21,0.2,0.2,0.19,0.22,0.2,0.2,0.21,0.2,0.21,0.21,0.21,0.2,0.21,0.21,0.22,0.21,0.21,0.21,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.21,0.2,0.21,0.23,0.22,0.21,0.22,0.22,0.21,0.22,0.23,0.22,0.21,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.23,0.22,0.23,0.21,0.21,0.22,0.21,0.22,0.2,0.21,0.2,0.21,0.2,0.21,0.21,0.21,0.21,0.22);
                    }
                    return list;
                }(),
              itemStyle: {
                  normal: {
                      lineStyle:{
                          width:1//设置线条粗细
                      }
                  }
              }
            },
            {
              symbol: "none",
                name:'2019/12/25',
                type:'line',
                data:function (){
                    var list = [];
                    for (var i = 1; i <= 144; i++) {
                        list.push(0.2,0.21,0.21,0.21,0.21,0.22,0.22,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.22,0.22,0.2,0.21,0.21,0.21,0.2,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.21,0.22,0.19,0.2,0.19,0.21,0.2,0.2,0.21,0.21,0.2,0.2,0.2,0.2,0.21,0.21,0.19,0.21,0.2,0.21,0.2,0.21,0.21,0.2,0.21,0.22,0.21,0.2,0.19,0.21,0.21,0.2,0.21,0.2,0.22,0.2,0.2,0.2,0.21,0.21,0.22,0.21,0.21,0.2,0.2,0.21,0.21,0.22,0.19,0.21,0.21,0.22,0.19,0.21,0.21,0.21,0.21,0.22,0.22,0.21,0.22,0.22,0.22,0.21,0.21,0.22,0.22,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.2,0.22,0.21,0.22,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.21,0.22,0.22,0.22,0.22,0.22,0.2,0.21,0.2,0.22,0.21,0.21,0.2,0.21,0.22,0.22,0.2,0.21,0.21,0.2,0.23,0.22);
                    }
                    return list;
                }(),
              itemStyle: {
                  normal: {
                      lineStyle:{
                          width:1//设置线条粗细
                      }
                  }
              }
            },
            {
              symbol: "none",
                name:'2019/12/26',
                type:'line',
                data:function (){
                    var list = [];
                    for (var i = 1; i <= 144; i++) {
                        list.push(0.19,0.21,0.21,0.22,0.22,0.22,0.22,0.2,0.2,0.22,0.19,0.21,0.21,0.21,0.21,0.21,0.23,0.21,0.2,0.22,0.22,0.23,0.21,0.21,0.2,0.23,0.2,0.21,0.19,0.2,0.2,0.2,0.21,0.21,0.22,0.22,0.2,0.21,0.19,0.2,0.2,0.2,0.21,0.21,0.21,0.21,0.21,0.22,0.2,0.22,0.21,0.2,0.19,0.21,0.21,0.21,0.21,0.21,0.21,0.22,0.21,0.2,0.2,0.2,0.19,0.19,0.22,0.22,0.21,0.2,0.2,0.2,0.2,0.2,0.22,0.22,0.22,0.21,0.2,0.2,0.2,0.21,0.22,0.22,0.19,0.19,0.2,0.2,0.19,0.21,0.21,0.22,0.22,0.22,0.22,0.21,0.2,0.2,0.2,0.1,0.1,0.2,0.21,0.21,0.21,0.21,0.2,0.2,0.2,0.21,0.2,0.22,0.21,0.22,0.2,0.21,0.21,0.21,0.22,0.21,0.22,0.21,0.21,0.22,0.22,0.22,0.22,0.22,0.2,0.21,0.2,0.22,0.21,0.21,0.2,0.21,0.22,0.21,0.21,0.21,0.21,0.21,0.21,0.22);
                    }
                    return list;
                }(),
              itemStyle: {
                normal: {
                  lineStyle:{
                      width:1//设置线条粗细
                  }
                }
              }
            },
            {
              symbol: "none",
                name:'平均线',
                type:'line',
                data:function (){
                    var list = [];
                    for (var i = 1; i <= 144; i++) {
                        list.push(0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21,0.21);
                    }
                    return list;
                }(),
              itemStyle: {
                normal: {
                  lineStyle:{
                    width:1//设置线条粗细
                  }
                }
              }
            }
          ]
      }
      el.setOption(option);
      })
    },
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
        7,
        this.container.clientWidth / this.container.clientHeight,
        1,
        8000
      );
      this.camera.position.set(200, 1000, 1800);
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
      scene.add(light);
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
          this.dialogVisible = true
          this.popUatat = intersects[0].object.data
        }
    },
    //加载模型c
    loadModel() {
      modelContainer = new THREE.Object3D();
      modelContainer.scale.set(this.glftScale, this.glftScale, this.glftScale);
      modelContainer.name = "modelContainer";
      modelContainer.position.set(0,0,0)
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
      axios.get('zgx.json').then(res=>{
          this.areaMap = res.data;
           // eslint-disable-next-line no-console
            // console.log(res)
          res.data.data.forEach(data => {
            // eslint-disable-next-line no-console
            console.log(data)
            this.loadModelMark(
              data.area_code,
              new THREE.Vector3(data.x, data.y),
              data.CITYTWON,
              data,
            );
             this.loadModelMark2(
              data.area_code,
              new THREE.Vector3(data.x, data.y),
              data.CITYTWON,
              data,
            )
          })
          this.loadArea();
      })
    },
    //加载区域
    loadArea(fileName,imgName) {
      let loader = new THREE.GLTFLoader(); /*实例化加载器*/
      loader.load(
        "zgx.gltf",
        function(obj) {
          var loader2 = new THREE.TextureLoader();
          var texture2 = loader2.load("6.jpg");
          var data = new THREE.MeshBasicMaterial({})
          texture2.repeat.set(1, 1);
          texture2.anisotropy = 16;
          data.map = texture2
          data.transparent = false;
          data.side = THREE.DoubleSide;
          // eslint-disable-next-line no-console
          obj.scenes[0].children[0].children[0].material = data
          obj.scenes[0].children[0].children[1].material = data
          obj.scenes[0].children[0].children[1].children[0].material = data
          obj.scenes[0].children[0].children[2].material = data
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
          obj.scene.name = fileName;
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = 40 + 'px " bold';
      ctx.fillStyle = '#00a3ea';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e, width / 2, height / 2);
      return canvas;
    },
    //加载标注e
    loadModelMark2(imgName, position,e,data) {
      // eslint-disable-next-line no-console
      console.log(imgName)
      let loader = new THREE.TextureLoader();
      var img = waterdrop2
      // if(e === '1'){
      //   img = waterdrop
      // }else if(e === '2'){
      //   img = waterdrop2
      // }else{
      //   img = waterdrop3
      // }
      
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
        new THREE.PlaneGeometry(75, 100, 1),
        material
      );
      // eslint-disable-next-line no-console
      plane.rotateX(0);
      plane.position.set(position.x, 200, position.y);
      plane.name = e
      plane.tag = "tag_";
      plane.data = data
      modelContainer.add(plane);
      markPanel.push(plane);
      clickObjects.push(plane)
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
      plane.position.set(position.x, 350, position.y);
      plane.tag = "tag_" + imgName;
      plane.name = e
      plane.data = data
      if(modelContainer === null){
        return false
      }
      modelContainer.add(plane);
      markPanel.push(plane);
      clickObjects.push(plane)
      if(e === 1){
        return false
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
      if(Array.isArray(markPanel) && this.$route.fullPath.startsWith('/Networkanalysis')){
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
  
  .btn-export {
    display: block;
    position: absolute;
    width: .6rem;
    height: .6rem;
    background: url('~@/assets/img/zoomout.png') no-repeat;
    background-size: 100% 100%;
    right: 0.4rem;
    top: 50%;
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
    top: 50%;
    margin-top: -.3rem;
    z-index: 99;
  }
  .Networkanalysis{
    height: calc(100vh - 1.5rem);
    position: relative;
    /deep/ .el-dialog__wrapper{
      display: flex;
      justify-content: center;
      align-items: center;
    }
    /deep/ .el-dialog{
            box-shadow:none;
            margin: 0!important;
            border-radius: 0.06rem;
            overflow: hidden;
            background: rgba(1,51,102,.9);
            border: 0.02rem solid #233f8b;
            .el-dialog__header{
              display: none!important;
            }
            .el-dialog__body{
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              padding: 0;
              .dialog_hint{
                background: #032255;
                font-size: 0.3rem;
                padding: 0.2rem;
                display: flex;
                color: #fff;
                justify-content: space-between;
              }
              .dialog_center{
                padding: 0.1rem 0;
                color: #00a3ea;
                .text{
                  display: flex;
                  justify-content: space-between;
                  padding: 0.1rem;
                  font-size: 0.2rem;
                  .rt{
                    display: flex;
                    align-items: center;
                    i{
                      display:inline-block;
                      width: 0.3rem;
                      height: 0.3rem;
                      background: url('~@/assets/images/line.png');
                      background-size: 100% 100%; 
                    }
                  }
                }
              }
            }
          }
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
