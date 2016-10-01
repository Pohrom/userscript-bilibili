// ==UserScript==
// @name        bilibili HTML5 播放器增强
// @author      MorHop
// @namespace   morhop_script
// @description 启用 bilibili 的 html5 播放器，自动宽屏模式、自动关灯模式、自动关闭弹幕、原生右键菜单、移除弹幕发送栏、关灯模式下自动隐藏播放控制栏和滚动条
// @version     1.0
// @include     http://www.bilibili.com/video/av*
// @include     http://bangumi.bilibili.com/anime/v/*
// @run-at      document-start
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==
'use strict';
(function () {
    let url = GM_getValue('url');
    GM_deleteValue('url');
    if (location.hostname == 'bangumi.bilibili.com') {
        if(url === location.href){
            return;
        }
        GM_setValue('url', location.href);
        document.addEventListener('DOMContentLoaded', function () {
            window.stop();
            location.href = document.querySelector('.v-av-link').href;
        });
    } else {
        try{
            localStorage.setItem('bilibililover', 'YESYESYES');
            localStorage.setItem('defaulth5', '1');
        }catch(e){}
        window.addEventListener('load', function () {
            this.$ = unsafeWindow.jQuery;

            $('.bilibili-player-video-btn-widescreen').click();     // 启用宽屏
            $('.bilibili-player-video-btn-danmaku').click();        // 关闭弹幕

            scrollToPlayer();

            let intervalId  = setInterval(function(){
                if($('.bilibili-player-video-wrap video').length){

                    $('body')[0].style['overflow'] = ''
                    addEvent(document.getElementsByName('light_onoff')[0],'click',(e) => {
                        switchScrollbar();
                        if (IsInTurnOFF()){
                            // 进入关灯模式
                            $('.bilibili-player-video-control')[0].style['opacity'] = 0;
                        }
                        else {
                            // 退出关灯模式
                            $('.bilibili-player-video-control')[0].style['opacity'] = 1;
                        }
                    });
                    enableAutoHideControllerInTurnOFF();

                    document.getElementsByName('light_onoff')[0].click();   // 启用关灯模式
                    $('.bilibili-player-video-sendbar')[0].remove();        // 移除弹幕发送栏

                    setContextMenuHandler();
                    clearInterval(intervalId);
                }
            },500);
        });
    }

    function IsInTurnOFF() {
        return ($('#bilibiliPlayer')[0].className.indexOf('mode-light-off') != -1)?true:false;
    }

    function scrollToPlayer(){
        var player = $('#bilibiliPlayer');
        if($(window).scrollTop() === 0){
            $(window).scrollTop(player.offset().top + player.height() - $(window).height());
        }
    }

    function switchScrollbar(){
        $('body')[0].style['overflow'] = $('body')[0].style['overflow'] == 'hidden'?'':'hidden';
    }

    function enableAutoHideControllerInTurnOFF(){
        addEvent($('.bilibili-player-video-control')[0],'mouseenter',(e) => {
            if (IsInTurnOFF())$('.bilibili-player-video-control')[0].style['opacity'] = 0.8;
        });
        addEvent($('.bilibili-player-video-control')[0],'mouseleave',(e) => {
            if (IsInTurnOFF())$('.bilibili-player-video-control')[0].style['opacity'] = 0.0;
        });
    }

    function withoutChildFunction(func){
        return function(e){
            var parent=e.relatedTarget;//上一响应mouseover/mouseout事件的元素
            while(parent!=this&&parent){//假如存在这个元素并且这个元素不等于目标元素（被赋予mouseenter事件的元素）
                try{
                    parent=parent.parentNode;
                }//上一响应的元素开始往上寻找目标元素
                catch(e){
                    break;
                }
            }
            if(parent!=this)//以mouseenter为例，假如找不到，表明当前事件触发点不在目标元素内
            func(e);//运行目标方法，否则不运行
        }
    }

    function addEvent(ele,type,func){
        if(window.document.all) {
            ele.attachEvent('on'+type,func);//ie系列直接添加执行
        } else {
            if(type === 'mouseenter') {
                ele.addEventListener('mouseover',withoutChildFunction(func),false);
            }
            else if(type === 'mouseleave') {
                ele.addEventListener('mouseout',withoutChildFunction(func),false);
            } else {
                ele.addEventListener(type,func,false);
            }
        }
    }

    function setContextMenuHandler(){
        let contextMenuEvent = $._data( document.querySelector('.bilibili-player-video-wrap'), "events" ).contextmenu[0];
        let oldHandler = contextMenuEvent.handler;

        let isElementClicked = function(ele, x, y){
            let rect = ele.getBoundingClientRect();
            return ((x > rect.left) && (x < rect.right) && (y > rect.top) && (y < rect.bottom));
        };

        let anyElementClicked = function(arr,x,y){
            for(let i = 0;i < arr.length; i++){
                if(isElementClicked(arr[i],x,y)){
                    return true;
                }
            }
            return false;
        };

        let newHandler = function(e){
            let eleArr = document.querySelectorAll('.bilibili-danmaku');
            if(anyElementClicked(eleArr,e.clientX,e.clientY)){
                oldHandler(e);
            }
        };

        contextMenuEvent.handler = exportFunction(newHandler,contextMenuEvent);
    }
}) ();