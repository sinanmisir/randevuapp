<?php 

	function HTTPPoster($prmPostAddress,$prmSendData){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,$prmPostAddress); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,TRUE); 
		curl_setopt($ch, CURLOPT_TIMEOUT, 30); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));			
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $prmSendData); 
		
		$result = curl_exec($ch);
		return $result;
	}

	function KullaniciKontrol(){
		$strXML = "<MainReportRoot><UserName>user-bayi</UserName><PassWord>tttt</PassWord><Action>4</Action></MainReportRoot>";
		$strDonus = HTTPPoster("http://g.iletimx.com/?anabayi=1",$strXML);
		$arrDonus = explode(Chr(10),$strDonus);
		$strDonus = implode("<br>",$arrDonus);
		echo $strDonus;
	}

	function MesajGonder1(){
		$strXML = "<MainmsgBody><UserName>user-bayi</UserName><PassWord>tttt</PassWord><Action>0</Action><Mesgbody>merhaba bu mesaj cok numaraya gidecek</Mesgbody><Numbers>5321234567,5421234567</Numbers><Originator>TEST</Originator><SDate></SDate></MainmsgBody>";
		$strDonus = HTTPPoster("http://g.iletimx.com/?anabayi=1",$strXML);
		echo $strDonus;
	}

	function MesajGonder2(){
		$strXML = "<MainmsgBody><UserName>user-bayi</UserName><PassWord>tttt</PassWord><Action>1</Action><Messages><Message><Mesgbody>coklu mesaj 1</Mesgbody><Number>5321234567</Number></Message><Message><Mesgbody>coklu mesaj 2</Mesgbody><Number>5421234567</Number></Message></Messages><Originator>TEST</Originator><SDate></SDate></MainmsgBody>";
		$strDonus = HTTPPoster("http://g.iletimx.com/?anabayi=1",$strXML);
		echo $strDonus;
	}

	function Raporla1(){
		$strXML = "<MainReportRoot><UserName>user-bayi</UserName><PassWord>tttt</PassWord><Action>3</Action><MsgID>1111</MsgID></MainReportRoot>";
		$strDonus = HTTPPoster("http://g.iletimx.com/?anabayi=1",$strXML);
		$arrDonus = explode(Chr(10),$strDonus);
		$strDonus = implode("<br>",$arrDonus);
		echo $strDonus;
	}
?>

<html>

<head>
<meta http-equiv="Content-Language" content="tr">
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-9">
<title>XML API PHP Örnek</title>
</head>

<body>
<table border="0" cellspacing="0" width="500" height="100%" id="AutoNumber1" style="border-collapse: collapse" bordercolor="#111111" cellpadding="0">
  <tr>
    <td width="50%" valign="top">
    	<table border="1" cellspacing="1" width="100%" id="AutoNumber2" height="100%" cellpadding="5" bordercolor="#000000">
          <tr>
            <td width="100%" valign="top">
            	<font face="Tahoma" size="2">
            		<?php            			
						switch (@$_POST["submit"]){
							Case "Kullanýcý bilgileri kontrolü" :
			    				KullaniciKontrol();
								break;
            				Case "Mesaj gönderimi (SMSToMany)" :
            					MesajGonder1();
								break;
            				Case "Mesaj gönderimi (SMS MultiSenders)" :
            					MesajGonder2();
								break;
		        			Case "TimerID bazýnda raporlama" :
			    				Raporla1();
								break;
						}            			
					?>
            	</font>
            &nbsp;</td>
          </tr>
        </table>
    </td>
    <td width="50%" valign="top">
    	<table border="0" cellspacing="1" width="100%" height="100" id="AutoNumber3">
    		<form name="frm1" method="POST" action="XMLOrnek.php">
	          <tr>
	            <td width="100%">
			    	<font face="Tahoma" size="2">	            
						<input type="submit" name="submit" value="Kullanýcý bilgileri kontrolü" style="font-family: Tahoma; font-size: 10pt; border: 1px solid #000000">
			     	</font>	            
	            </td>
    	      </tr>
        	  <tr>
	            <td width="100%">
			    	<font face="Tahoma" size="2">	            
						<input type="submit" name="submit" value="Mesaj gönderimi (SMSToMany)" style="font-family: Tahoma; font-size: 10pt; border: 1px solid #000000">
			     	</font>	            
	            </td>
	          </tr>
    	      <tr>
	            <td width="100%">
			    	<font face="Tahoma" size="2">	            
						<input type="submit" name="submit" value="Mesaj gönderimi (SMS MultiSenders)" style="font-family: Tahoma; font-size: 10pt; border: 1px solid #000000">
			     	</font>	            
	            </td>
	          </tr>
    	      <tr>
	            <td width="100%">
			    	<font face="Tahoma" size="2">	            
						<input type="submit" name="submit" value="TimerID bazýnda raporlama" style="font-family: Tahoma; font-size: 10pt; border: 1px solid #000000">
			     	</font>	            
	            </td>
	          </tr>
			</form>
        </table>				
    </td>
  </tr>
</table>
</body>

</html>
