--------- Hackathon Project 说明 ---------

** 概述 **
后端采用Flask,前端使用angularJS
后端Flask负责提供各种API及支持用户登录注册等特性, 不使用其MVC
前端使用angularJS的MVC特性,目前分为两个angular app,分别是 
(1)pageApp:是页面内容,即无需登录就可以看到的内容,包括开发文档, 关于等内容
(2)user_centerApp:用户中心.用户登录后可用的管理功能
前端还引入了其他库,如BootStrap,jQuery等

** 文件清单 **
	app.main.py 
		后端主程序文件
	run.py
		运行本地服务器(Debug用)
	Readme.txt
		说明文件
	site.wsgi
		mod_wsgi配置文件
	hack_project_libs/
		py模块目录
	static/
		静态文件目录,包括前端所用到的资源以及angularJS的MVC
	static/templates
		angualrJS模板目录
	templates/
		flask模板目录,这个目录应该会被逐渐废弃


** flask运行所需组件 **

	(1)python2.7
		略

	(2)setuptool
		For Windows
			https://pypi.python.org/pypi/setuptools/
		For Linux/Unix
			wget https://bootstrap.pypa.io/ez_setup.py -O - | sudo python
			or
			sudo apt-get install python-dev python-setuptools

	(3)flask
		http://flask.pocoo.org/

	(4)mongokit
		https://github.com/namlook/mongokit

	(5)PIL (Python Image Library)
		原版PIL问题很多
		For Windows
			解决方案：安装PIL的一个修正版pillow
			http://www.lfd.uci.edu/~gohlke/pythonlibs/
		For Linux/Unix
			理论上可以重新编译PIL，##http://www.pythonware.com/products/pil/，但是很麻烦
			所以还是pillow
				http://pillow.readthedocs.org/en/latest/
				一些依赖库:
					sudo apt-get install libtiff4-dev libjpeg8-dev zlib1g-dev \
			   		libfreetype6-dev liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk
		   		https://pypi.python.org/pypi/Pillow

** Debug **
	以上组件安装完成后,运行python run.py即可开启本地debug模式(127.0.0.1:5000)

** 部署到服务器:Apache+mod_WSGI+Flask **	
		以下示例中项目文件目录:/var/www/hack_project,用户ubuntu
		Apache安装过程略
		安装 mod-wsgi
			apt-get install libapache2-mod-wsgi

		创建WSGI文件(参看site.wsgi)		
		
		配置Apache(在Apache的配置文件httpd.conf中写入)
			<VirtualHost *>
			    ServerName hackthon.com
			    WSGIDaemonProcess myapp user=ubuntu group=ubuntu threads=5
			    WSGIScriptAlias / /var/www/hack_project/site.wsgi

			    <Directory /var/www/hack_project>
			        WSGIProcessGroup myapp
			        WSGIApplicationGroup %{GLOBAL}
			        Order deny,allow
			        Allow from all
			    </Directory>
			</VirtualHost>

** 一些其他的疑难杂症 **

(1)python2.7中minetypes.py的UnicodeDecodeError
	错误提示信息： 
		File D:Python27libmimetypes.py, line 249, in enum_types ctype = ctype.encode(default_encoding) # omit in 3.x!  UnicodeDecodeError: 'ascii' codec can't decode byte 0xb0 in position 1: ordinal not in range(128)
	解决办法：
	 	文件位置：
			C:\Python27\Lib\mimetypes.py
		修改原函数为：
		try:                   
			ctype = ctype.encode(default_encoding) # omit in 3.x!                
		#except UnicodeEncodeError:                
		except UnicodeError:                    
			pass
		注释了原来的异常判断。
		
(2)验证码无法显示
	Linux下验证码生成所用字体的ttf文件需要指定绝对路径(此问题已解决)