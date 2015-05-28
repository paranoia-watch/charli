jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    return this;
}
var repositionAndScale = function () {
	$('#bigtext').bigtext().center()
}


var index = parseFloat(document.getElementById("index").innerHTML)
var socket = io()

// how many decimal places allows
var decimal_places = 2
var decimal_factor = decimal_places === 0 ? 1 : decimal_places * 10

socket.on('info', function (data) {
	console.log(data)
})

socket.on('update', function (data) {
	// 	document.getElementById("index").innerHTML = data.index;
	var oldIndex = parseFloat(document.getElementById("index").innerHTML)
	index = parseFloat(data.index)
	console.log(oldIndex, index)
	$('#index').prop('number', oldIndex * decimal_factor).animateNumber(
		{
			number: index * decimal_factor,

			numberStep: function(now, tween) {
				var floored_number = parseFloat(now / decimal_factor).toFixed(2)
				var target = $(tween.elem)

				target.text(floored_number)
				repositionAndScale()
			}
		},
		1000
	)
})

repositionAndScale()