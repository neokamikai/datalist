$.dataList = function(a, o){
	this.targetList = a;
	this.options = o;
	this.search = function(t){
		//this.targetList.dataListSet.
	}
	this.destroy = function(){
		$(this.targetList).children().remove();
		delete this.dataListSet;
	}
	this.isPageButtonVisible = function (p, cp, a, c){
		var r = cp - a - 1, l = c - (cp + a);
		r = r < 0 ? Math.abs(r) : 0;
		l = l < 0 ? Math.abs(l) : 0;
		if(p >= (cp - a - l) && p <= (cp + a + r)){
			return true;
		}
		console.log({p:p, cp:cp, a:a, c: c, l: l});
		return false;
	}
	this.showItems = function(a, t){
		$(t).children().remove();
		if(t.dataListSet.api.options.paging){
			var pages = {1:[]}, cp=1, ipp = parseInt(t.dataListSet.$lengthMenu.val());
			a.forEach(function(item){
				if(pages[cp].length >= ipp)
					pages[++cp] = [];
				if(pages[cp].length < ipp)
					pages[cp].push(item);
			});
			
			a = pages[t.dataListSet.currentPage];
			t.dataListSet.$divPageButtons.children().remove();
			var $first = $(document.createElement('BUTTON')).html('Primeira').prop({targetList:t, disabled: t.dataListSet.currentPage == 1, page: 1})
				.addClass('data-list-page-button-first')
				.on('click', function(){console.log(this.page); this.targetList.dataListSet.currentPage = this.page;})
				.on('click', t.dataListSet.api.executeSearch)
			var $last = $(document.createElement('BUTTON')).html('Última').prop({targetList:t,disabled: t.dataListSet.currentPage == cp, page: cp})
				.addClass('data-list-page-button-last')
				.on('click', function(){console.log(this.page); this.targetList.dataListSet.currentPage = this.page;})
				.on('click', t.dataListSet.api.executeSearch);
			var $prev = $(document.createElement('BUTTON')).html('Anterior').prop({targetList:t, disabled: t.dataListSet.currentPage == 1, page: t.dataListSet.currentPage-1})
				.addClass('data-list-page-button-prev')
				.on('click', function(){console.log(this.page); this.targetList.dataListSet.currentPage = this.page;})
				.on('click', t.dataListSet.api.executeSearch)
			var $next = $(document.createElement('BUTTON')).html('Próxima').prop({targetList:t,disabled: t.dataListSet.currentPage == cp, page: t.dataListSet.currentPage+1})
				.addClass('data-list-page-button-next')
				.on('click', function(){console.log(this.page); this.targetList.dataListSet.currentPage = this.page;})
				.on('click', t.dataListSet.api.executeSearch);
			var ssb =  cp >= (t.dataListSet.api.options.pagingNeighbors * 2 + 1);
			if(ssb)
				t.dataListSet.$divPageButtons.append($first);
			if(cp > 1)
				t.dataListSet.$divPageButtons.append($prev);
			for(var p in pages){
				if(!t.pageButtons) t.pageButtons = {};
				var $button = (t.pageButtons[p]||$(document.createElement('BUTTON')).text(p))
				.addClass('data-list-page-button')
				.on('click', function(){console.log(this.page); this.targetList.dataListSet.currentPage = this.page;})
				.on('click', t.dataListSet.api.executeSearch)
				.prop({targetList: t, page: p, disabled: p == t.dataListSet.currentPage});
				t.pageButtons[p] = $button;
				if(t.dataListSet.api.isPageButtonVisible(p, t.dataListSet.currentPage, t.dataListSet.api.options.pagingNeighbors, cp)){
					t.dataListSet.$divPageButtons.append($button);
					t.dataListSet.pageButtons.push($button)
				}
			}
			if(cp > 1)
				t.dataListSet.$divPageButtons.append($next);
			if(ssb)
				t.dataListSet.$divPageButtons.append($last);
		}
		//else {
			a.forEach(function(item){
				 $(t).append(item);
			})
		//}
		
	}
	this.executeSearch = function(event){
		console.log(event.type);
		if(!this.targetList.dataListSet.api.options.autoSearch && !['click', 'change'].includes(event.type) && event.keyCode != 13) return;
		var shown = [], value = this.targetList.dataListSet.$searchField.val();
		this.targetList.dataListSet.api.options.data.forEach(function(li){
			if(value.trim().length == 0 || li.text().toLowerCase().indexOf(value.toLowerCase()) >= 0){
				shown.push(li);
			}
		});
		this.targetList.dataListSet.api.showItems(shown, this.targetList);
	}
	return this;
}
$.fn.DataList = function(a){
	var options = $.extend({paging: false, searching:true, autoSearch:true, searchButtonClassName:''}, a);
	if(!options.lengthMenu || options.lengthMenu.length == 0) options.lengthMenu = [10,50,100];
	if(!options.pagingNeighbors || options.pagingNeighbors < 0) options.pagingNeighbors = 2;
	options.lengthMenu=options.lengthMenu.sort(function(a,b){return a-b;});
	this.each(function(){
		if(this.tagName != 'UL'){
			if(options.create){
				var ul = $(document.createElement('UL'));
				$(this).append(ul).DataList(options.create);
			}
			return;
		}
		if(!this.dataListSet){
			this.dataListSet = {api: new $.dataList(this, options)};
			this.dataListSet.$holder = $(document.createElement('DIV')).addClass('data-list-holder').insertBefore(this);
			if(options.searching || options.paging) this.dataListSet.$divFilter = $(document.createElement('DIV')).addClass('data-list-filter');
			this.dataListSet.$holder.append(this.dataListSet.$divFilter);
			this.dataListSet.$holder.append(this);
			if(options.paging){
				this.dataListSet.$lengthMenu = $(document.createElement('SELECT')).prop({targetList: this})
				.on('change', function(){this.targetList.dataListSet.currentPage = 1;})
				.on('change', this.dataListSet.api.executeSearch);
				this.dataListSet.$lengthMenuHolder = $(document.createElement('DIV')).addClass('data-list-length-menu');
				for(var i = 0; i < options.lengthMenu.length; i++) {
					var item = options.lengthMenu[i];
					this.dataListSet.$lengthMenu.append($(document.createElement('OPTION')).attr({value:item}).text(item));
				}
				
				this.dataListSet.$lengthMenuHolder.append($(document.createElement('LABEL')).text('Mostrar:').css('padding-right', '5px'));
				this.dataListSet.$lengthMenuHolder.append(this.dataListSet.$lengthMenu);
				this.dataListSet.$lengthMenuHolder.append($(document.createElement('LABEL')).text('itens por página').css('padding-left', '5px'));
				this.dataListSet.$divFilter.append(this.dataListSet.$lengthMenuHolder);
			}
			if(options.searching){
				this.dataListSet.$divSearch = $(document.createElement('DIV')).addClass('data-list-search');
				this.dataListSet.$searchField = $(document.createElement('INPUT')).prop({type:'text', targetList: this})
				.on('keyup', this.dataListSet.api.executeSearch);
				console.log(this.dataListSet.$searchField);
				this.dataListSet.$divSearch.append($(document.createElement('LABEL')).text('Filtro:').css('padding-right', '5px'));
				this.dataListSet.$divSearch.append(this.dataListSet.$searchField);
				if(!options.autoSearch){
					this.dataListSet.$searchButton = $(document.createElement('BUTTON')).prop({type:'button',targetList: this}).text('Filtrar').addClass(options.searchButtonClassName)
					.on('click',this.dataListSet.api.executeSearch)
					this.dataListSet.$divSearch.append(this.dataListSet.$searchButton);
				}
				this.dataListSet.$divFilter.append(this.dataListSet.$divSearch);
			}
			if(options.paging){
				this.dataListSet.pageButtons = [];
				this.dataListSet.currentPage = 1;
				this.dataListSet.$divPageButtons = $(document.createElement('DIV')).addClass('data-list-page-buttons');
				this.dataListSet.$holder.append(this.dataListSet.$divPageButtons);
			}
		}
		if(options.retrieve && !options.data){
			options.data = [];
			$(this).children('li').each(function(){
				options.data.push($(this));
			});
			if(options.paging){
				this.dataListSet.$lengthMenu.change();
			}
		}
		else if(options.data){
			if(options.destroy) this.dataListSet.api.destroy();
			options.data.forEach(function(item, i){
				var li = document.createElement('LI');
				li.innerHtml = li;
				$(this).append(li);
			});
		}
		
		console.log(options.data);
	})
	return this;
}
