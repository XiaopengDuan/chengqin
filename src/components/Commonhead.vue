<template>
  <div class="Commonhead">
    <div>
        <ul class="left-nav">
            <li>
                <router-link to="/Businessbigdataanalysis"><span :class="{'text':$route.fullPath.startsWith('/Businessbigdataanalysis')}">营业大数据分析</span></router-link>
            </li>
        </ul>
    </div>
    <div>
        <h1 class="center_text">
            {{
                $route.fullPath.startsWith('/Businessbigdataanalysis')?'营业大数据分析':$route.fullPath.startsWith('/Networkanalysis')&&'管网分析'
            }}
        </h1>
    </div>
    <div>
        <ul class="left-nav">
            <li>
                <router-link to="/Networkanalysis"><span :class="{'text':$route.fullPath.startsWith('/Networkanalysis')}">管网分析</span></router-link>
            </li>
        </ul>
    </div>
  </div>
</template>
<script>
// @ is an alias to /src

export default {
  name: 'Commonhead',
  data(){
    return {}
  },
  components: {
  },
  methods: {
    unfold() {
        this.$store.commit('app/IS_UNFOLD',!this.$store.getters.isunfold)
    },
    authority() {
    },
    changePwd() {
    },
    logout() {
        this.$store.dispatch('user/logout')
    }
  }
}
</script>
<style lang="less" scoped>
    .Commonhead{
        width: 100%;
        height: 1.11rem;
        background: url('../assets/images/headbj.png') no-repeat;
        background-size: 100%;
        display: flex;
        justify-content: space-evenly;
        box-sizing: border-box;
        padding: 0.2rem;
        z-index: 100;
        position: relative;
        div{
            flex: 1 1;
            .center_text{
                color: #fff;
                font-family: serif;
            }
            .left-nav *{
                color: #e1e3e9;
            }
            .left-nav{
                display: flex;
                justify-content: space-evenly;
                font-size: 0.16rem;
                li{
                    span.text{
                        color: #0c89e2
                    }
                }
                .personalcenter{
                    padding-left: 0.36rem;
                    background: url('../assets/images/man.png') no-repeat left;
                    background-size: 0.2rem;
                    position: relative;
                    .bottom-text{
                        float: right;
                        margin-left: 0.16rem;
                        height: 0.2rem;
                        width: 0.2rem;
                        background: url('../assets/images/unfold.png') no-repeat center;
                        background-size: 50%;
                        transition:all 500ms;
                        &.top-text{
                            transform: rotate(200grad)
                        }
                    }
                }
                .dropdown-contents{
                    z-index: 9999;
                    background:linear-gradient(to top,#031537,#193472);
                    position: absolute;
                    right: 0;
                    top: 0.36rem;
                    overflow: hidden;
                    transition:all 500ms;
                    height: 0;
                    &.unfold{
                        height: 1.5rem;
                    }
                    a{
                        display: block;
                        line-height: 0.5rem;
                        min-width: 1.5rem;
                        display: flex;
                        justify-content: space-evenly;
                        align-items: center;
                        &:hover{
                            background:linear-gradient(to top,#031537,#193472);
                            cursor: pointer
                        }
                        &:active{
                            color: #0c89e2
                        }
                    }
                }
            }
        }
    }
</style>