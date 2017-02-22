

#### Run these examples

You can `git clone` this repo and launch your favorite static HTTP server.
If you don't have one, you may install nodeJs and the `http-server`package like so :

    npm install -g http-server

Then open a terminal in the directory containing the example you wish to visualize and enter the following command

    http-server -a 0.0.0.0

You only need to connect to `http://my_ip:8080` with a mobile device connected to your local network.


#### Support :

<table>
  <tr>
    <th></th>
    <th align="center" colspan="4"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/os-icons/android_96x96.png"> <br/> Android</th>
    <th align="center" colspan="2"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/os-icons/ios_96x96.png"> <br/> IOS</th>
    <th align="center" colspan="2"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/os-icons/windows_96x96.png"> <br/> Windows Phone</th>
  </tr>
  <tr>
    <td></td>

    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/chrome_64x64.png"> <br/> Chrome </td>
    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/opera_64x64.png"> <br/> Opera</td>
    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/samsung-internet_64x64.png"> <br/> Samsung Internet</td>
    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/firefox_64x64.png"> <br/> Firefox</td>

    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/safari-ios_64x64.png"> <br/> Safari</td>
    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/android_64x64.png"> <br/> Others</td>

    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/edge-tile_64x64.png"> <br/> Edge</td>
    <td align="center"> <img src="https://github.com/vguillou/installable-web-app/blob/master/assets/browser-icons/internet-explorer-tile_64x64.png"> <br/> Internet Explorer</td>
  </tr>
  <tr>
    <td>1- Home screen shortcut</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> IOS 1</td>
    <td align="center">✘ <br/> No API on IOS</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Windows Phone 7</td>
    <td align="center">✘ <br/> No API on IOS</td>
  </tr>
  <tr>
    <td>2- Standalone mode</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> IOS 1</td>
    <td align="center">✘ <br/> No API on IOS</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Windows Phone 7</td>
    <td align="center">✘ <br/> 2017 ?</td>
  </tr>
  <tr>
    <td>3- Install banner</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> IOS 1</td>
    <td align="center">✘ <br/> No API on IOS</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Windows Phone 7</td>
    <td align="center">✘ <br/> 2017 ?</td>
  </tr>
  <tr>
    <td>4- 'Deep' install</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>
    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Android 4.4</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> IOS 1</td>
    <td align="center">✘ <br/> No API on IOS</td>

    <td align="center"><strong>v55</strong> <br/> nov. 2013 <br/> Windows Phone 7</td>
    <td align="center">✘ <br/> 2017 ?</td>
  </tr>
</table>


## 1- Add a Home Screen shortcut

In addition to a `<title>` tag, you need to add a number of tags in the `<head>` of each Html page that should support the 'Add to Home screen' feature.
As for producing a favicon, producing a homogenous shortcut [across browsers and OS is actually very complicated](http://realfavicongenerator.net/favicon_compatibility). It is therefore recommended to use a generator to produce every icon and tags that you need to support all modern platforms.
[This generator](http://realfavicongenerator.net/) can be confidently used and offers a comprehensive guide, complete with previews, numerous options and an expensive [http://realfavicongenerator.net/faq](FAQ) if you wish to understand and/or play around with the generated tags/icons.

Note that unfortunately, IOS does not provide developers with an API to add custom icons to the user's Home screen. Therefore, third party browsers cannot support the 'Add to Home screen' feature.


## 2- Standalone mode, removing the browser's interface

blabla

If you implement this behaviour, chances are your web application is [responsive](todo), in which case, it is good practice to disable zooming in/out the page, as your UI should already be displayed in an optimal fashion. To do so, you can add the following `<meta>` tag :

    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>


### IOS - Safari

It is fairly easy to add support for a standalone mode for Mobile Safari on IOS. Only a couple of `<meta>` tags are needed :

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">

The first line tells the OS to launch in standalone mode, hiding the browser's UI, while the second lets the developer control the style of the status bar, as it's name implies.
For additional information, you can refer to Apple's [official developer guide](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html) and their [supported `meta` tags](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html).



* Stay in the Standalone mode. [See this Gist for more implementation details](https://gist.github.com/irae/1042167)
* Always offer visible navigation, including a back button
* Different LocalStorage ?


### Android

##### Chrome-based browsers


## 3- Automatic install banner


## 4- Integrating the shortcut
