var existingCardNumber;

$(document).ready(function() {
	setEventHandlers() ;

	penniesLoaded = $.pennies && $.pennies.donationWidget;

	if(penniesLoaded) {
		setupPennies() ;
	}

	$("form").first().each(function() {
    	if (this.name == "main-form") {
    	    toggleCardTypeChange();
    	    checkCardType(false);
    	}
    });	
	
}); 

function setupPennies() {
	$("#pennies-widget").donationWidget({
		onDonationAdd: function( event, data ) {
			var donationAmount = data.donationAmount/100.00;
			setDonation(donationAmount) ;
			updateAmountValues() ;
		},

		onDonationRemove: function( event, data ) {
			setDonation(0) ;
			updateAmountValues() ;
		},
	
		onLoad: function( event, data ) {
			setDonation(0) ;
			updateAmountValues() ;
		}
	});	
}

function setCommand(value) {
	$("#command").val(value);
}

function submitForm() {
	$('form[name$="form"]').trigger("submit");
}

function submitWithCommand(value) {
	setCommand(value) ;
	submitForm() ;
}

function clearErrors() {
	$(".error").each(function() {
		$(this).empty();
	    $(this).css("display","none");
	});
	$(".errorRow").each(function() {
	    $(this).css("display","none");
	});
}

function setEventHandlers() {
    $("#submit1, #submit2").on("click", function () {
    	if ($(this).attr('disabled') != 'disabled') {
        	$(this).attr('disabled', true);
        	submitWithCommand("continue") ;
    	}
    });
    
    $("#cancel, #cancel1, #cancel2").on("click", function () {
    	if ($(this).attr('disabled') != 'disabled') {
        	$(this).attr('disabled', true);
        	submitWithCommand("cancel") ;
    	}
    });
    
    $("#cardNumber").on("focus", function () {
    	existingCardNumber = $("#cardNumber").val();
    	$("#submit1, #submit2").attr('disabled','disabled');
    });
    
    $("#cardNumber").on("blur", function () {
    	checkCardType(true);
    });
    
    $('[data-toggle="tooltip"]').tooltip( {trigger : 'click | hover', placement : 'right' }); 

}

// Change visibility of various card details fields, based on flags from Ajax response.
function setFieldVisibility(flagObj) {
    $("#issueNumberRow").css("display",flagObj.issueNumber?"block":"none");
	$("#issueNumber").attr('maxlength',Number(flagObj.issueNumber?flagObj.issueNumberLength:0));
    $("#startDateRow").css("display", flagObj.startDate?"block":"none");
    $("expiryDateRow").css("display",flagObj.expiryDate?"block":"none");
}

// Use values in hidden form fields to decouple from presentation
function getAmount() {
	return $("#amountTotal").val() ;
}

function getSurcharge() {
	return $("#surcharge").val() ;
}

function setSurcharge(value) {
	$("#surcharge").val(value) ;
}

function getDonation() {
	return $("#donationAmount").val() ;
}

function setDonation(value) {
	return $("#donationAmount").val( formatAmountInPounds(value) ) ;
}

// Put a value in an amount field, apply formatting.
function setAmountField(field,pounds) {
	$(field).text( formatAmountInPounds(pounds?pounds:0) ) ;
}

// Make a block visible/invisible, and set value of field inside that block.
function setAmountVisibility(block,field,pounds,visible) {
	$(block).css("display",visible?"block":"none") ;
	setAmountField(field,pounds) ;
}

// Make sure all amount fields have correct values & visibility, based on current value settings.
function updateAmountValues() {
	var amount    = getAmount() ;
	var surcharge = getSurcharge() ;
	var donation  = getDonation() ;
	var total     = parseFloat(amount) + parseFloat(surcharge) + parseFloat(donation) ;
	
	setAmountVisibility("#surchargeDetails","#surchargeText",surcharge,surcharge>0) ;
	setAmountVisibility("#donationDetails","#donationText",donation,donation>0) ;
	// Show the original amount 
	setAmountVisibility("#transactionAmountDetails","#transactionAmountText",amount,(donation>0 || surcharge>0) ) ;
	setAmountField("#totalAmountText",total) ;
}

// Return true if card scheme doesn't require the card details fields.
function hasNoCard(cardScheme) {
	var name = cardScheme? cardScheme.text() : null ;
	return name == "PayPal" ;
}

// Make the card details fields visible or invisible depending on card scheme
function setCardDetailsVisibility(cardScheme) {
	var cardDetails = $("#cardDetails");
	var cardSchemeSelect = $("#cardSchemeSelect");

	// RS19569a hide cardSchemeSelect
	cardSchemeSelect.css("display","none");
	
	// Hide card details section if no card scheme selected
	if( cardScheme==null || hasNoCard(cardScheme) ) {
		// RS19569a always show card details
		cardDetails.css("display","block");
	}
	else {
		cardDetails.css("display","block");
	}
}

// Called when card type is changed.
function toggleCardTypeChange() {	
	var cardScheme = getScheme();

	if( cardScheme==null ) {
		setDonation(0) ;
		setSurcharge(0) ;
	}
	else {
		var surchargePence  = parseFloat(getScheme().attr("data-surch"));
		var surchargePounds = parseFloat(surchargePence / 100.0) ;
	    setSurcharge(surchargePounds? surchargePounds.toFixed(2): 0) ;
	}

	updateAmountValues() ;
    setCardDetailsVisibility(cardScheme) ;

	if(penniesLoaded) {
		var amountInPence = getAmount() * 100.0 ;
		if (cardScheme != null) {
		   $("#pennies-widget").donationWidget('reload', getScheme().attr("data-donation"), amountInPence);
		}
	}
}
			
function formatAmountInPounds(pounds) {
	var n = parseFloat(pounds) ;
	var str = n.toFixed(2) ;
	return str ;
}

function checkCardType(showErrorsFlag) {
	var cardNumber = $("#cardNumber").val();
	var cardScheme = getScheme();
	
	if (typeof(existingCardNumber) === "undefined") {
		existingCardNumber = "";
	}
	
    $("#issueNumberRow").css("display","none");
    $("#startDateRow").css("display","none");
    $("#expiryDateRow").css("display","block");
    
    if ( existingCardNumber != "" && cardNumber == existingCardNumber ) {
    	$("#submit1, #submit2").prop( "disabled", false ) ;
    }
    else
    // perform ajax call if a card number is present but not if a token (masked card number) is present
	if (cardNumber != "" && !isNaN(cardNumber)) {	
		// $.ajax(
		// {  
	    //     type: "POST",  
	    //     url: "ajax",  
	    //     data: {"cardBin": cardNumber},
	    //     success: function(data) {
	    //     	checkCardTypeDone(data,showErrorsFlag) ;
	    //     },
	    //     error: function(data) {
	    //     	checkCardTypeFail(data,showErrorsFlag) ;
	    //     }
	    // }); 
	}
}

function getScheme() {
	var cardScheme = $('#cardSchemeId option:selected');
	if (cardScheme && cardScheme != "" && cardScheme.text() != "") {
		return cardScheme;
	}
	return null;
}

// Called when card type check ajax call does not get a successful response
function checkCardTypeFail(data,showErrorsFlag) {
	if(showErrorsFlag) {
		setErrorMessage("#cardTypeError","Entered card is not valid") ;
	}
	$("#submit1, #submit2").prop( "disabled", false ) ;
}

// Called when card type check ajax call gets a successful response
function checkCardTypeDone(data,showErrorsFlag) {

	var responseObj = JSON.parse( data.substr(5) ) ;
	
    var selectedCardScheme = null;
    if (getScheme() != null) {
    	selectedCardScheme = getScheme().val();
    }
    var actualCardScheme = responseObj.cardName;
    
    //RS19569a
    if (actualCardScheme != null && (selectedCardScheme == null || actualCardScheme != selectedCardScheme)) {
    	
    	$('#cardSchemeId').val(actualCardScheme).trigger("change");
    	$('#cardSchemeId option').each(function () {
    	    if ($(this).val() == actualCardScheme) {
    	        $(this).prop('selected','selected');
    	        return;
    	    }
    	});
    	if (getScheme() != null) {
            selectedCardScheme = getScheme().val();
    	}
    }
    
	if(showErrorsFlag) {
	    if (selectedCardScheme != actualCardScheme) {
	    	setErrorMessage("#cardTypeError","Card type not supported") ;
		}
	    else {
			setErrorMessage("#cardTypeError","") ;
	    }
	}
	
	toggleCardTypeChange() ;
	setFieldVisibility(responseObj) ;
	$("#submit1, #submit2").prop( "disabled", false ) ;
}

function setErrorMessage(id,errorMsg) {
  if(errorMsg) {
	  $(id).html(errorMsg) ;
	  $(id).css("display","block") ;
	  $(id).removeClass("ppErrorHidden").addClass("ppError") ;
  }
  else {
	  $(id).html('') ;
	  $(id).css("display","none") ;
	  $(id).removeClass("ppError").addClass("ppErrorHidden") ;
  }
}

// handle show/hide buttons
function toggleMask(id, img) {
	  
	  input=document.getElementById(id);
	  image=document.getElementById(img);
	  
	  if (input.type === "password") {
	    input.type = "tel";
	    image.src = "pp/images/pwshow.png";
	  } else {
	    input.type = "password";
	    image.src = "pp/images/pwhide.png";
	  }
	  input.focus();
}
