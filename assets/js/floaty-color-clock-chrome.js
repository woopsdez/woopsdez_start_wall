// =====================
// -- 時間表示 --
// =====================
// ----- 関数群 -----

// 時間取得
function getTime () {
	var days    = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	var d       = new Date(); // インスタンス作成

	// それぞれを変数に入れていく
	var month   = d.getMonth() + 1;
	var day     = d.getDate();
	var week    = days[d.getDay()];

	var hours   = d.getHours();
	var minutes = d.getMinutes();
	var seconds = d.getSeconds();

	// もし分が一桁だったら二桁にする
	if (Math.floor(minutes / 10) === 0) {
		minutes = "0" + minutes;
	}

	// 日付と曜日をまとめる
	var mdw = month + "/" + day + " " + week;

	// 割合を求める
  // hoge% = 今までの秒数 / 1日の秒数
	// 「比べられる量」＝「もとにする量」×「割合」
	var _sec = hours*60*60 + minutes*60 + seconds; // 現在時刻の秒数
	var _per = _sec / 86400;  
  var _pow = Math.pow(10, 2); // 桁を切り捨て
  var _pwdNum = Math.round(_per*_pow) / _pow;
  var pwd = 360 * _pwdNum;

	// それぞれの値を返す
	return {
		"hours"   : hours,
		"minutes" : minutes,
		"seconds" : seconds,
		"mdw"     : mdw,
		"pwd"     : pwd
	};
}

// =====================
// 天気情報を取得
// =====================

function extractWeatherData (jsonp) {
	var re = /^[^{]*({.*})[^}]*$/;
	var data = jsonp.match(re);
	if (data) {
		var weatherData = JSON.parse(data[1]);
		processWeatherData (weatherData);
	}
}

function processWeatherData (data) {
		// 地域データを取得
		var prefName = data.pref.id;
		var area = data.pref.area;
		for (var key in area){ // areaのプロパティ名をkeyに入れる
			var areaName = key;
			$("#area").append('<option value="'+ key +'">'+ key +'</option>');
		}

		// 降水確立を取得
		var period = data.pref.area[key].info[0].rainfallchance.period; //長いので一時格納			

		for (var i = 0; i < period.length; i++) { // periodに格納している数だけ繰り返す
			data = period[i]; // periodをdataに入れる
			// --- 天気の処理 ---
			// 降水確立の数字をアイコンにマッピング
			if ( data.content <= 30 ) {
				iconClass = "wi wi-day-sunny";
			}else
			if ( data.content > 31 && data.content <= 60 ) {
				iconClass = "wi wi-cloudy";
			}else
			if ( data.content >= 61){
				iconClass = "wi wi-rain";
			}else{
				iconClass = "fa fa-question";
			}

			// 長ったらしいパスを格納
			var icon = $(".weather i");
			var rainNum = $(".rainfall");

			$(icon[i]).attr("class", iconClass);
			$(rainNum[i]).text(data.content+"%");
		}

		// 県名を英語に変換
		var jp = jpPrefecture;
		var prefNameEn = jp.prefConvert(prefName, "en");

		console.log(prefNameEn);
		$("#areaName small").text(prefNameEn);
		$("#pref").val(String(prefNum));

	// 地域の変更
	$("#pref").change(
		function(){
			prefNum = $('select option:selected').val();
			localStorage.setItem('prefNum', prefNum);
			$.get('http://www.drk7.jp/weather/json/'+ prefNum +'.js', extractWeatherData);
			$('#area').remove();
			$('#setArea').append('<select id="area" name="ara"></select>');
		}
		);
}

// 取得した時間をHTMLに書き込む
function refleshTime (){
	var t = getTime();
	$("#numH").text(t.hours);
	$("#numM").text(t.minutes);
	$("#dw").text(t.mdw);
	$('.bg img').css('transform', 'rotate(-'+ t.pwd +'deg)').delay(800).addClass('zoomIn').fadeIn();
}

// ロードするjson urlの初期値
var prefNum = 13;

// selectの値が保存してあれば、それを初期値とする
if (localStorage.prefNum !== undefined) {
	prefNum = localStorage.prefNum;
} else {
	localStorage.setItem('prefNum', prefNum);
}

$.get('http://www.drk7.jp/weather/json/'+ prefNum +'.js', extractWeatherData);
refleshTime();
setInterval(refleshTime,1000);

// =====================
// -- slide menu --
// =====================
function openSlide(){
	$(this).removeClass('off');
	$(this).addClass('on');
	$('.setting').animate({left: '0'});
	$('.detail').animate({left: '280px'});
	$('.on').off('click');
	$('.on').click(closeSlide);
}

function closeSlide(){
	$(this).removeClass('on');
	$(this).addClass('off');
	$('.setting').animate({left: '-280px'});
	$('.detail').animate({left: '0'});
	$('.off').off('click');
	$('.off').click(openSlide);
}

$('.off').hover(
	function(){
		$(this).animate({
			opacity: '1'
		});
	},
	function(){
		$(this).animate({
			opacity: '0'
		});
	}
	);

$('.detail').click(openSlide);

// =====================
// -- css set propaty --
// =====================

// 設定を保存
if (localStorage.color !== undefined) {
	console.log(localStorage.color);
	$('.detail').css('color', localStorage.color);
	$('.bg img').attr('src','assets/img/rotateGround-' + localStorage.color + '.png');
	$('#textColor input').each(function(){
		var str = $(this).attr('value');
		if (localStorage.color === str) {
			$(this).prop('checked',true);
		}
	});
} else {
	localStorage.setItem('color', 'white');
	$('.bg img').attr('src','assets/img/rotateGround-' + localStorage.color + '.png');
}

if (localStorage.fontName !== undefined) {
	console.log(localStorage.fontName);
	$('body').css('font-family', localStorage.fontName);

	// 選択した書体をselectedにしておく
	$('#selectFont option').each(function () {
		var str = $(this).attr('value');
		if (localStorage.fontName === str) {
			$('#selectFont').val(str);
		}
	});
} else {
	localStorage.setItem('fontName', 'HelveticaNeue-UltraLight');
}

// text color
function setTextColor(e, colorName){
	$(e).on('click', function(){
		localStorage.setItem('color', colorName);
		$('.detail').css("color", colorName);
		$('.bg img').attr('src','assets/img/rotateGround-' + localStorage.color + '.png');
	});
}
setTextColor('#textWhite', 'white');
setTextColor('#textBlack', 'black');

// font
$('.style #selectFont').change(function(){
	fontName = $(this).val();
	localStorage.setItem('fontName', fontName);
	$('body').css("font-family", localStorage.fontName);
});

// ====================
// Fullscreen
// ====================

var target = document.getElementById("target");
var btn    = document.getElementById("fullscreenSwitch");

/*フルスクリーン実行用ファンクション*/
function requestFullscreen() {
	if (target.webkitRequestFullscreen) {
		target.webkitRequestFullscreen(); //Chrome15+, Safari5.1+, Opera15+
	} else if (target.mozRequestFullScreen) {
		target.mozRequestFullScreen(); //FF10+
	} else if (target.msRequestFullscreen) {
		target.msRequestFullscreen(); //IE11+
	} else if (target.requestFullscreen) {
		target.requestFullscreen(); // HTML5 Fullscreen API仕様
	} else {
		alert('ご利用のブラウザはフルスクリーン操作に対応していません');
		return;
	}
	/*フルスクリーン終了用ファンクションボタンに切り替える*/
	btn.onclick = exitFullscreen;
}

/*フルスクリーン終了用ファンクション*/
function exitFullscreen() {
	if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen(); //Chrome15+, Safari5.1+, Opera15+
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen(); //FF10+
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen(); //IE11+
	} else if(document.cancelFullScreen) {
		document.cancelFullScreen(); //Gecko:FullScreenAPI仕様
	} else if(document.exitFullscreen) {
		document.exitFullscreen(); // HTML5 Fullscreen API仕様
	}
	/*フルスクリーン実行用ファンクションボタンに切り替える*/
	btn.onclick = requestFullscreen;
}
/*サポートしていないIE10以下とスマフォではフルスクリーンボタンを非表示*/
if(typeof window.orientation != "undefined" || (document.uniqueID && document.documentMode < 11)){
	btn.style.display = "none";
}

$('#fullscreenSwitch').on('click', requestFullscreen);

// ====================
// Google Analytics
// ====================

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-413655-13', 'auto');
ga('send', 'pageview');