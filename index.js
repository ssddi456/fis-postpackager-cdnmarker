var path = require('path');
module.exports = function( ret, conf, settings, opt ) {
    // foreach res/pkg add cdn properties
    // for which has a cdn properties
    var map = ret.map;

    var src = ret.src;
    var res = map.res;

    var pkg  = ret.pkg;
    var mpkg = map.pkg;

    var getPackMap = function (ret, conf, settings, opt) {
        var uriToIdMap = {};
        var fileToPack = {};
        var packToFile = {};

        fis.util.map(ret.map.pkg, function (id, pkg) {
            uriToIdMap[pkg.uri] = id;
        });

        fis.util.map(ret.pkg, function (subpath, file) {
            var uri = file.getUrl(opt.hash, opt.domain);
            var id = uriToIdMap[uri];
            if (id) {
                //没有ID的PKG文件无需建立MAP
                packToFile[id] = file;
                fileToPack[file.getId()] = {
                    id: id,
                    pkg: ret.map.pkg[id]
                };
            }
        });

        return {
            packToFile: packToFile,
            fileToPack: fileToPack
        };
    }

    var pack_map = getPackMap.apply(null, [].slice.call(arguments));


    function absolutePathToRelativePath ( file ) {
        var content = file.getContent();
        var f_url = path.dirname(file.uri || file.url);

        var relative_to_file =  function( url ) {
            var quot = url[0];

            if( quot == '\'' || quot == '\"' ){
                url = url.slice(1,-1);
            } else {
                quot = '';
            }

            if( url[0] == '/' ){
                return quot + path.relative(f_url, url).replace(/\\/g,'/') + quot;
            }

            return url;
        }

        var reg = /(\/\*[\s\S]*?(?:\*\/|$))|(?:@import\s+)?\burl\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}\s]+)\s*\)(\s*;?)/g;
        content = content.replace(reg, function(m, comment, url, last ){
            if(url){
                if(m.indexOf('@') === 0){
                    return '@import url(' + relative_to_file(url) + ')' + last;
                } else {
                    return 'url(' + relative_to_file(url) + ')' + last;
                }
            } else {
                return m;
            }
        });

        file.setContent(content);
    }

    fis.util.map( src, function( subpath, file ) {
        if( file.useMap ){
            var map_node = res[file.getId()];
            if( 'useCdn' in file ){
                map_node.useCdn = file.useCdn ? 1 : 0;
            }
            if( map_node.type == 'css'){
                absolutePathToRelativePath(file);
            }
        }
    });

    fis.util.map( pkg, function( subpath, pkg ) {
        var pkg_recode = pack_map.fileToPack[pkg.getId()];

        if( !pkg_recode ){
            return;
        }

        var pkg_recode = mpkg[pkg_recode.id];
        if( 'useCdn' in pkg ) {
            pkg_recode.useCdn = pkg.useCdn ? 1 : 0;
        }
        if( pkg_recode.type == 'css'){
            absolutePathToRelativePath(pkg);
        }
    });
}