$(function() {
	Parse.initialize(
		'qCUFX3elaNOUb2sOeGHLJmsl1WChXZHwniSYTeLI',
		'UBsewl7YjqVdJAMu1ZEzqxuiCiBjouUGVAzg0cpG'
	);
	var amount,
		carouselInt,
		firstName,
		handler,
		lastName,
		myScroll,
		q,
		t;

	var NUM_PICS = $('#scroller').children().length;

	function setupStripe() {
		handler = StripeCheckout.configure({
			key: 'pk_test_Fd3CLcLTQUqe2W7N9mqdazhC',
			image: 'images/favicon.ico',
			allowRememberMe: false,
			currency: 'cad',
			token: chargeCard,
			panelLabel: "Pay {{amount}}"
		});

		// Close Checkout on page navigation
		$(window).on('popstate', function() {
			handler.close();
		});
	}

	function chargeCard(token) {
		// activate spinner
		// Use the token to create the charge with a server-side script.
		Parse.Cloud.run('charge', {
			amount: amount,
			email: token.email,
			firstName: firstName,
			lastName: lastName,
			token: token.id
		}, {
			success: function(res) {
				// toastr.success('Purchase Success! Here is your Transaction ID:</br>' +
				// 	res + '</br></br>Don\'t worry we\'ve also sent you an email.'
				// );
				alert('Success, here\'s your transaction id: ' + res);
			},
			error: function(err) {
				// $('#spinner').addClass('hidden').spin(false);
				// toastr.error('An error occured, please try again');
				console.error('cloud_err=', err);
				alert('An error occured');
			}
		});
	}

	function setupClicks() {
		$('header a').on('click', goToSection);

		$('#buyTicket').on('click', function() {
			// Open Checkout with further options
			$('#purchaseOverlay').show().addClass('active');
			$('body').addClass('noScroll');
		});

		$('#purchaseClose').on('click', function() {
			$('#purchaseContent input').removeClass('invalid');
			$('body').removeClass('noScroll');
			$('#purchaseOverlay').removeClass('active').delay(1).hide();
		});

		$('#purchase').on('click', purchaseClicked);

		$('html, body').keyup(function(e) {
			if (e.keyCode == 27) $('#purchaseClose').trigger('click');
			else if (e.keyCode == 37 || e.keyCode == 39) restartTimers();
		});

		$('.quantityChange').on('click', function(e) {
			if (e.target.classList.contains('disabled') || e.target.parentElement.classList.contains('disabled')) return;

			if (e.target.id == 'increase') {
				plus(parseInt($('#amount').text()));
			} else if (e.target.id == 'decrease') {
				minus(parseInt($('#amount').text()));
			} else if (e.target.children[0].id == 'increase') {
				plus(parseInt($('#amount').text()));
			} else {
				minus(parseInt($('#amount').text()));
			}
		});

		$('.scroll').on('click', function() {
			restartTimers();
			if ($(this).hasClass('scrollLeft')) prevCara();
			else nextCara();
		});
	}

	function restartTimers() {
		clearTimeout(t);
		clearInterval(carouselInt);

		t = setTimeout(function() {
			carouselInt = setInterval(nextCara, 5000);
		}, 10000);
	}

	function purchaseClicked(e) {
			var invalid = validateFields();
			if (invalid.length) {
				invalid.forEach(function(i) {
					i.addClass('invalid');
				});
				$('#purchaseContent').addClass('shake');
				setTimeout(function() {
					$('#purchaseContent').removeClass('shake');
				}, 401);
			} else {
				amount = 100 * $('#amount').text();
				firstName = $('#firstName').val();
				lastName = $('#lastName').val();

				handler.open({
					amount: amount,
					currency: 'cad',
					name: 'CUF Donation'
				});
				e.preventDefault();
				setTimeout(function() {
					$('#purchaseClose').trigger('click');
				}, 200);
			}
	}

	function plus(val) {
		$("#amount").text(val + 1);
		if (val == 0) {
			$(".quantityChange.noLeftMargin").removeClass('disabled');
			$('#purchase').removeClass('disabled').attr('disabled', false);
		}
	}

	function minus(val) {
		$("#amount").text(val - 1);
		if (val == 1) {
			$('#amount').prev().addClass('disabled');
			$('#purchase').addClass('disabled').attr('disabled', true);
		}
	}

	function validateFields() {
		var invalid = [];
		if ($('#firstName').val().trim().length < 2) {
			invalid.push($('#firstName'));
		}
		if ($('#lastName').val().trim().length < 2) {
			invalid.push($('#lastName'));
		}
		return invalid
	}

	function setupToastr() {
		toastr.options = {
			'closeButton': true,
			'debug': false,
			'newestOnTop': false,
			'progressBar': false,
			'positionClass': 'toast-top-center',
			'preventDuplicates': false,
			'onclick': null,
			'showDuration': '300',
			'hideDuration': '1000',
			'timeOut': '0',
			'extendedTimeOut': '0',
			'showEasing': 'swing',
			'hideEasing': 'linear',
			'showMethod': 'fadeIn',
			'hideMethod': 'fadeOut',
			'tapToDismiss': false
		}
	}

	function goToSection(e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: $('#' + $(e.target).attr('label-for')).offset().top
		},
			'slow'
		);
	}

	function nextCara() {
		if (myScroll.currentPage.pageX == NUM_PICS - 1) {
			myScroll.goToPage(0, 0, 2000, IScroll.utils.ease.circular);
			// myScroll.currentPage.pageX = -1;
		} else {
			myScroll.next();
		}
	}

	function prevCara() {
		if (myScroll.currentPage.pageX == 0) {
			myScroll.goToPage(NUM_PICS - 1, 0, 2000, IScroll.utils.ease.circular);
		} else {
			myScroll.prev();
		}
	}

	function setupCarousel() {
		$("#viewport").height($("body").height() * .85 - $("#gallery h1").outerHeight(true));
		myScroll = new IScroll('#wrapper', {
			scrollX: true,
			scrollY: false,
			momentum: false,
			snap: true,
			snapSpeed: 600,
			keyBindings: true
		});
		carouselInt = setInterval(nextCara, 5000);
	}

	setupClicks();
	setupStripe();
	// setupToastr();
	// setupCarousel();

	console.log('ready');
});
