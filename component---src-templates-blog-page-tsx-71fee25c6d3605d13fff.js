(window.webpackJsonp=window.webpackJsonp||[]).push([[7,6],{QeBL:function(e,t,a){"use strict";a.r(t);a("0mN4");var n=a("q1tI"),r=a.n(n),l=a("Wbzz"),c=a("yE/o"),i=a("FcLX"),o=a("z8k1"),s=a("3mGJ"),d=a("+6Dn"),u=a("yIZz"),m=(a("tUrg"),a("pVnL")),p=a.n(m),h=a("lwsE"),v=a.n(h),f=a("W8MJ"),b=a.n(f),g=a("a1gu"),E=a.n(g),O=a("Nsbk"),j=a.n(O),N=a("PJYZ"),k=a.n(N),y=a("7W2i"),C=a.n(y),A=a("lSNA"),I=a.n(A),L=a("3WF5"),x=a.n(L),T=a("Og4/"),P=a.n(T),w=a("TSYQ"),z=a.n(w),K=(a("17x9"),a("ZeOK")),V=a("ICNK"),W=a("Y53p"),D=a("H+2d"),G=a("MZgk");function J(e){var t=e.children,a=e.className,n=e.content,l=z()(a,"description"),c=Object(V.a)(J,e),i=Object(W.a)(J,e);return r.a.createElement(i,p()({},c,{className:l}),D.a.isNil(t)?n:t)}J.handledProps=["as","children","className","content"],J.propTypes={},J.create=Object(G.c)(J,(function(e){return{content:e}}));var Q=J;function S(e){var t=e.children,a=e.className,n=e.content,l=z()("header",a),c=Object(V.a)(S,e),i=Object(W.a)(S,e);return r.a.createElement(i,p()({},c,{className:l}),D.a.isNil(t)?n:t)}S.handledProps=["as","children","className","content"],S.propTypes={},S.create=Object(G.c)(S,(function(e){return{content:e}}));var M=S;function X(e){var t=e.children,a=e.className,n=e.content,l=e.description,c=e.floated,i=e.header,o=e.verticalAlign,s=z()(Object(K.e)(c,"floated"),Object(K.f)(o),"content",a),d=Object(V.a)(X,e),u=Object(W.a)(X,e);return D.a.isNil(t)?r.a.createElement(u,p()({},d,{className:s}),M.create(i),Q.create(l),n):r.a.createElement(u,p()({},d,{className:s}),t)}X.handledProps=["as","children","className","content","description","floated","header","verticalAlign"],X.propTypes={},X.create=Object(G.c)(X,(function(e){return{content:e}}));var Y=X,Z=a("D1pA");function B(e){var t=e.className,a=e.verticalAlign,n=z()(Object(K.f)(a),t),l=Object(V.a)(B,e);return r.a.createElement(Z.a,p()({},l,{className:n}))}B.handledProps=["className","verticalAlign"],B.propTypes={},B.create=Object(G.c)(B,(function(e){return{name:e}}));var F=B,H=a("YO3V"),R=a.n(H),q=a("5XkN"),U=function(e){function t(){var e,a;v()(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return a=E()(this,(e=j()(t)).call.apply(e,[this].concat(r))),I()(k()(a),"handleClick",(function(e){a.props.disabled||P()(a.props,"onClick",e,a.props)})),a}return C()(t,e),b()(t,[{key:"render",value:function(){var e=this.props,a=e.active,l=e.children,c=e.className,i=e.content,o=e.description,s=e.disabled,d=e.header,u=e.icon,m=e.image,h=e.value,v=Object(W.a)(t,this.props),f=z()(Object(K.a)(a,"active"),Object(K.a)(s,"disabled"),Object(K.a)("li"!==v,"item"),c),b=Object(V.a)(t,this.props),g="li"===v?{value:h}:{"data-value":h};if(!D.a.isNil(l))return r.a.createElement(v,p()({},g,{role:"listitem",className:f,onClick:this.handleClick},b),l);var E=F.create(u,{autoGenerateKey:!1}),O=q.a.create(m,{autoGenerateKey:!1});if(!Object(n.isValidElement)(i)&&R()(i))return r.a.createElement(v,p()({},g,{role:"listitem",className:f,onClick:this.handleClick},b),E||O,Y.create(i,{autoGenerateKey:!1,defaultProps:{header:d,description:o}}));var j=M.create(d,{autoGenerateKey:!1}),N=Q.create(o,{autoGenerateKey:!1});return E||O?r.a.createElement(v,p()({},g,{role:"listitem",className:f,onClick:this.handleClick},b),E||O,(i||j||N)&&r.a.createElement(Y,null,j,N,i)):r.a.createElement(v,p()({},g,{role:"listitem",className:f,onClick:this.handleClick},b),j,N,i)}}]),t}(n.Component);I()(U,"handledProps",["active","as","children","className","content","description","disabled","header","icon","image","onClick","value"]),U.propTypes={},U.create=Object(G.c)(U,(function(e){return{content:e}}));var $=U;function _(e){var t=e.children,a=e.className,n=e.content,l=Object(V.a)(_,e),c=Object(W.a)(_,e),i=z()(Object(K.a)("ul"!==c&&"ol"!==c,"list"),a);return r.a.createElement(c,p()({},l,{className:i}),D.a.isNil(t)?n:t)}_.handledProps=["as","children","className","content"],_.propTypes={};var ee=_,te=function(e){function t(){var e,a;v()(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return a=E()(this,(e=j()(t)).call.apply(e,[this].concat(r))),I()(k()(a),"handleItemOverrides",(function(e){return{onClick:function(t,n){P()(e,"onClick",t,n),P()(a.props,"onItemClick",t,n)}}})),a}return C()(t,e),b()(t,[{key:"render",value:function(){var e=this,a=this.props,n=a.animated,l=a.bulleted,c=a.celled,i=a.children,o=a.className,s=a.content,d=a.divided,u=a.floated,m=a.horizontal,h=a.inverted,v=a.items,f=a.link,b=a.ordered,g=a.relaxed,E=a.selection,O=a.size,j=a.verticalAlign,N=z()("ui",O,Object(K.a)(n,"animated"),Object(K.a)(l,"bulleted"),Object(K.a)(c,"celled"),Object(K.a)(d,"divided"),Object(K.a)(m,"horizontal"),Object(K.a)(h,"inverted"),Object(K.a)(f,"link"),Object(K.a)(b,"ordered"),Object(K.a)(E,"selection"),Object(K.b)(g,"relaxed"),Object(K.e)(u,"floated"),Object(K.f)(j),"list",o),k=Object(V.a)(t,this.props),y=Object(W.a)(t,this.props);return D.a.isNil(i)?D.a.isNil(s)?r.a.createElement(y,p()({role:"list",className:N},k),x()(v,(function(t){return $.create(t,{overrideProps:e.handleItemOverrides})}))):r.a.createElement(y,p()({role:"list",className:N},k),s):r.a.createElement(y,p()({role:"list",className:N},k),i)}}]),t}(n.Component);I()(te,"Content",Y),I()(te,"Description",Q),I()(te,"Header",M),I()(te,"Icon",F),I()(te,"Item",$),I()(te,"List",ee),I()(te,"handledProps",["animated","as","bulleted","celled","children","className","content","divided","floated","horizontal","inverted","items","link","onItemClick","ordered","relaxed","selection","size","verticalAlign"]),te.propTypes={};var ae=te,ne=function(e){return n.createElement(o.a,null,n.createElement(o.a.Content,null,n.createElement(o.a.Header,null,"Tags")),n.createElement(o.a.Content,null,n.createElement(ae,null,e.tags.map((function(t){var a=t.fieldValue===e.tag,r="/blog/tags/"+t.fieldValue+"/";return n.createElement(ae.Item,{as:"span",key:t.fieldValue},n.createElement(ae.Icon,{name:"tag",color:a?"blue":null}),n.createElement(ae.Content,{style:a?{fontWeight:"700"}:null},n.createElement(e.Link,{to:r},t.fieldValue," (",t.totalCount,")")))})))))},re=(a("a1Th"),a("Btvt"),a("KKXr"),a("9VmF"),a("R6OX")),le=a("LvDl"),ce=function(e){if(1===e.pageCount)return null;var t=e.pathname.startsWith("/blog/page/")?e.pathname.split("/")[3]:"1";return n.createElement(re.a,{pagination:!0},Object(le.times)(e.pageCount,(function(a){var r=(a+1).toString(),l=e.pageCount<10?5:3,c=+r-l<+t&&+r+l>+t,i=+r===e.pageCount;return c||1==+r||i?n.createElement(re.a.Item,{key:r,style:{cursor:"pointer"},as:e.Link,to:"/blog/page/"+r+"/",name:r,active:t===r}):+r==e.pageCount-1||2==+r?n.createElement(re.a.Item,{key:r,disabled:!0},"..."):null})))},ie=a("soUV");a.d(t,"pageQuery",(function(){return oe}));t.default=Object(ie.a)((function(e){var t=e.data.tags.group,a=e.data.posts.edges,r=e.location.pathname,m=Math.ceil(e.data.posts.totalCount/10),p=n.createElement(c.a,null,a.map((function(e){var t=e.node,a=t.frontmatter,r=t.timeToRead,c=t.fields.slug,s=t.excerpt,d=a.author.avatar.children[0],u=Object(le.get)(a,"image.children.0.fixed",{}),m=n.createElement(i.a.Group,null,n.createElement(i.a,null,n.createElement(i.a.Avatar,{src:d.fixed.src,srcSet:d.fixed.srcSet}),n.createElement(i.a.Content,null,n.createElement(i.a.Author,{style:{fontWeight:400}},a.author.id),n.createElement(i.a.Metadata,{style:{margin:0}},a.updatedDate," - ",r," min read")))),p=n.createElement(o.a.Description,null,s,n.createElement("br",null),n.createElement(l.Link,{to:c},"Read more…"));return n.createElement(o.a,{key:c,fluid:!0,image:u,header:a.title,extra:m,description:p})})));return n.createElement(c.a,null,n.createElement(u.a,null),n.createElement(s.a,{vertical:!0},n.createElement(d.a,{padded:!0,style:{justifyContent:"space-around"}},n.createElement("div",{style:{maxWidth:600}},p,n.createElement(s.a,{vertical:!0,textAlign:"center"},n.createElement(ce,{Link:l.Link,pathname:r,pageCount:m}))),n.createElement("div",null,n.createElement(ne,{Link:l.Link,tags:t,tag:e.pageContext.tag})))))}));var oe="30877247"},vkDq:function(e,t,a){"use strict";a.r(t),a.d(t,"pageQuery",(function(){return r}));var n=a("QeBL");t.default=n.default;var r="2468622471"}}]);
//# sourceMappingURL=component---src-templates-blog-page-tsx-71fee25c6d3605d13fff.js.map