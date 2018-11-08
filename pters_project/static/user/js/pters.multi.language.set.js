var multiLanguage = { 'KOR':
    {'DD':'매일', 'WW':'매주', '2W':'격주',
        'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일',
        "WeekSmpl":['일','월','화','수','목','금','토']
    },
    'JPN':
        {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
            'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日',
            "WeekSmpl":['日','月','火','水','木','金','土']
        },
    'ENG':
        {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
            'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat',
            "WeekSmpl":['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
        }
};


var multi_language_set = {
                            "KOR":{
                                    "text-hello":"안녕하세요!",
                                    "text-today":"오늘",
                                    "text-lesson":"레슨",
                                    "text-off":"OFF",
                                    "text-add":"추가",
                                    "text-register":"등록",
                                    "text-plan":"일정",
                                    "text-lessonplan":"레슨<br>일정",
                                    "text-offplan":"OFF<br>일정",
                                    "text-memberadd":"회원<br>추가",
                                    "text-memberadd_full":"회원 추가",
                                    "text-memberreadd":"재등록",
                                    "text-addlessonplan":"+ 레슨 일정 등록",
                                    "text-addoffplan":"+ OFF 일정 등록",
                                    "text-todayplan":"오늘 일정",
                                    "text-weekplan" :"주간 일정",
                                    "text-monthplan":"월간 일정",
                                    "text-membermanage":"회원",
                                    "text-groupmanage":"그룹",
                                    "text-classmange":"클래스",
                                    "text-lecturemanage":"수업",
                                    "text-ticketmanage":"수강권",
                                    "text-centermanage":"센터 관리",
                                    "text-employeemanage":"직원 관리",
                                    "text-analytics":"통계",
                                    "text-setting":"설정",
                                    "text-nameAttach":"님",
                                    "text-logout":"로그아웃",
                                    "text-alarm":"알림",
                                    "text-program":"프로그램",
                                    "text-programselect":"프로그램 선택",
                                    "text-mypage":"마이페이지",
                                    "text-help":"이용문의",
                                    "text-payment":"PTERS패스",
                                    "text-w":"주",
                                    "text-m":"월",

                                    "text-basicsetting":"기본 설정",
                                    "text-programmanage":"프로그램 관리",
                                    "text-reservesetting":"회원 예약 설정",
                                    "text-pushsetting":"푸시 알림 설정",
                                    "text-bgsetting":"배경화면 설정",
                                    "text-purchase":"이용권 구매",
                                    "text-language":"Language/言語/언어",
                                    "text-fromptersteam":"피터스 공지",
                                    "text-aboutus":"About us",

                                    "text-yes":"예",
                                    "text-no":"아니오",
                                    "text-ok":"확인",
                                    "text-cancel":"취소",
                                    "text-delete":"삭제",
                                    "text-close":"닫기",

                                    "text-inprogress":"진행중",
                                    "text-finish":"종료",
                                    "text-processend":"진행 완료",
                                    "text-resume":"재개",
                                    "text-refund":"환불",
                                    "text-unconnect":"연결해제",
                                    "text-connectrequest":"연결요청",

                                    "text-sort":"정렬 기준",

                                    "text-plancomplete":"일정 완료",
                                    "text-plancancel":"일정 취소",
                                    "text-completesign":"완료 서명",
                                    "text-pleasesign":"회원님 완료 서명을 입력해주세요.",
                                    "text-participants":"참석자",

                                    "text-thisgroupmember":"이 유형 회원",
                                    "text-listloading":"리스트 불러오는 중...",
                                    "text-moveprogram":"프로그램을 선택하면 이동합니다.",
                                    "text-memocaution":"레슨일정의 메모는 회원님께 공유됩니다.",

                                    "text-deletequestion-plan":"정말 일정을 취소하시겠습니까?",

                                    "text-memberinfo":"회원 정보",
                                    "text-ordernum":"순번",
                                    "text-membername":"회원명",
                                    "text-grouptype":"수강유형",
                                    "text-memberid":"회원 ID",
                                    "text-email":"이메일",
                                    "text-regcount":"등록 횟수",
                                    "text-remaincount":"남은 횟수",
                                    "text-startdate":"시작일",
                                    "text-enddate":"종료일",
                                    "text-contact":"연락처",
                                    "text-manage":"관리",

                                    "text-refresh":"새로고침",
                                    "text-zoomin":"일정 확대 보기",
                                    "text-zoomout":"일정 보기 원래대로",
                                    "text-youcan-usecal":"일정을 확인하고 등록 할 수 있습니다.",

                                    "text-dd":"매일", "text-ww":"매주", "text-2w":"격주",
                                    "text-sunday":"일요일", "text-monday":"월요일","text-tuesday":"화요일","text-wednesday":"수요일","text-thursday":"목요일","text-friday":"금요일","text-saturday":"토요일",
                                    "text-sundaymin":"일","text-mondaymin":"월","text-tuesdaymin":"화","text-wednesdaymin":"수","text-thursdaymin":"목","text-fridaymin":"금","text-saturdaymin":"토",

                                    "text-footerdisplay":"block",
                                    "text-company":"회사소개",
                                    "text-business":"제휴제안",
                                    "text-policy":"이용약관",
                                    "text-privacy":"개인정보처리방침",
                                    "text-manual":"사용법 및 FAQ"
                                 },

                            "JPN":{
                                    "text-hello":"Hello!",
                                    "text-today":"今日",
                                    "text-lesson":"レッスン",
                                    "text-off":"OFF",
                                    "text-add":"追加",
                                    "text-register":"登録",
                                    "text-plan":"日程",
                                    "text-lessonplan":"レッスン<br>追加",
                                    "text-offplan":"OFF<br>追加",
                                    "text-memberadd":"会員<br>追加",
                                    "text-memberadd_full":"会員追加",
                                    "text-memberreadd":"再登録",
                                    "text-addlessonplan":"+ レッスン プラン 追加",
                                    "text-addoffplan":"+ OFF プラン 追加",
                                    "text-todayplan":"今日の日程",
                                    "text-weekplan" :"週間カレンダー",
                                    "text-monthplan":"月間カレンダー",
                                    "text-membermanage":"会員管理",
                                    "text-groupmanage":"グループ管理",
                                    "text-classmange":"クラス管理",
                                    "text-lecturemanage":"授業管理",
                                    "text-ticketmanage":"受講券",
                                    "text-centermanage":"センター管理",
                                    "text-employeemanage":"職員管理",
                                    "text-analytics":"統計",
                                    "text-setting":"設定",
                                    "text-nameAttach":"様",
                                    "text-logout":"ログアウト",
                                    "text-alarm":"通知",
                                    "text-program":"プログラム",
                                    "text-programselect":"プログラム選択",
                                    "text-mypage":"マイページ",
                                    "text-help":"ヘルプ",
                                    "text-payment":"利用券",
                                    "text-w":"週",
                                    "text-m":"月",

                                    "text-basicsetting":"基本設定",
                                    "text-programmanage":"プログラム管理",
                                    "text-reservesetting":"予約関連",
                                    "text-pushsetting":"プッシュ通知設定",
                                    "text-bgsetting":"背景設定",
                                    "text-purchase":"利用券購買",
                                    "text-language":"Language/言語/언어",
                                    "text-fromptersteam":"お知らせ",
                                    "text-aboutus":"About us",

                                    "text-yes":"はい",
                                    "text-no":"いいえ",
                                    "text-ok":"確認",
                                    "text-cancel":"取り消し",
                                    "text-delete":"削除",
                                    "text-close":"閉じる",

                                    "text-processend":"完了",
                                    "text-resume":"再開",
                                    "text-refund":"払戻",
                                    "text-unconnect":"連動解除",
                                    "text-connectrequest":"連動要請",

                                    "text-sort":"並べ替え",

                                    "text-inprogress":"進行中",
                                    "text-finish":"終了",
                                    "text-plancomplete":"日程完了",
                                    "text-plancancel":"日程削除",
                                    "text-completesign":"完了署名",
                                    "text-pleasesign":"会員の署名を書いてください",
                                    "text-participants":"参加者",

                                    "text-thisgroupmember":"このタイプのメンバー",
                                    "text-listloading":"リストをローディング中...",
                                    "text-moveprogram":"プログラムを選択してください。",
                                    "text-memocaution":"このメモ―は会員と共有します。",

                                    "text-deletequestion-plan":"日程を削除しますか",

                                    "text-memberinfo":"メンバー情報",
                                    "text-ordernum":"順番",
                                    "text-membername":"会員名",
                                    "text-grouptype":"受講タイプ",
                                    "text-memberid":"会員ID",
                                    "text-email":"メール",
                                    "text-regcount":"登録回数",
                                    "text-remaincount":"残余回数",
                                    "text-startdate":"開始日",
                                    "text-enddate":"終了日",
                                    "text-contact":"連絡先",
                                    "text-manage":"管理",

                                    "text-refresh":"Refresh",
                                    "text-zoomin":"拡大して見る",
                                    "text-zoomout":"元に戻す",
                                    "text-youcan-usecal":"スケジュールの登録・確認ができます。",

                                    "text-dd":"毎日", "text-ww":"毎週", "text-2w":"隔週",
                                    "text-sunday":"日曜日", "text-monday":"月曜日",　"text-tuesday":"火曜日",　"text-wednesday":"水曜日",　"text-thursday":"木曜日",　"text-friday":"金曜日",　"text-saturday":"土曜日",
                                    "text-sundaymin":"日",　"text-mondaymin":"月",　"text-tuesdaymin":"火",　"text-wednesdaymin":"水",　"text-thursdaymin":"木",　"text-fridaymin":"金",　"text-saturdaymin":"土",

                                    "text-footerdisplay":"none",
                                    "text-company":"会社紹介",
                                    "text-business":"提携",
                                    "text-policy":"利用規約",
                                    "text-privacy":"個人情報処理方針",
                                    "text-manual":"使用法＆FAQ"
                                 },

                            "ENG":{
                                    "text-hello":"What a nice day!",
                                    "text-today":"Today",
                                    "text-lesson":"Plan",
                                    "text-off":"OFF",
                                    "text-add":"Add",
                                    "text-register":"Register",
                                    "text-plan":"Plan",
                                    "text-lessonplan":"Add<br>Plan",
                                    "text-offplan":"Add<br>OFF",
                                    "text-addlessonplan":"+ Add Plan",
                                    "text-addoffplan":"+ Add OFF",
                                    "text-memberadd":"Add<br>Member",
                                    "text-memberadd_full":"Add member",
                                    "text-memberreadd":"Re-Reg",
                                    "text-todayplan":"Day Cal.",
                                    "text-weekplan" :"Week Cal.",
                                    "text-monthplan":"Month Cal.",
                                    "text-membermanage":"Members",
                                    "text-groupmanage":"Groups",
                                    "text-centermanage":"Center",
                                    "text-employeemanage":"Employee",
                                    "text-classmange":"Classes",
                                    "text-lecturemanage":"Lectures",
                                    "text-ticketmanage":"Session Pass",
                                    "text-analytics":"Analytics",
                                    "text-setting":"Settings",
                                    "text-nameAttach":"",
                                    "text-logout":"Logout",
                                    "text-alarm":"Log",
                                    "text-program":"Program",
                                    "text-programselect":"Program Select",
                                    "text-mypage":"My page",
                                    "text-help":"Help",
                                    "text-payment":"Purchase",
                                    "text-w":"W",
                                    "text-m":"M",

                                    "text-basicsetting":"Basic Settings",
                                    "text-programmanage":"Program Manage.",
                                    "text-reservesetting":"Reserv. Settings",
                                    "text-pushsetting":"Push Settings",
                                    "text-bgsetting":"Background Settings",
                                    "text-purchase":"Purchase membership",
                                    "text-language":"Language/言語/언어",
                                    "text-fromptersteam":"Notice from PTERS",
                                    "text-aboutus":"About us",

                                    "text-yes":"Yes",
                                    "text-no":"No",
                                    "text-ok":"Ok",
                                    "text-cancel":"Cancel",
                                    "text-delete":"Delete",
                                    "text-close":"Close",

                                    "text-inprogress":"In progress",
                                    "text-finish":"Finished",
                                    "text-processend":"Progress end",
                                    "text-resume":"Resume",
                                    "text-refund":"Refund",
                                    "text-unconnect":"Unconnect",
                                    "text-connectrequest":"Send Connect Request",

                                    "text-sort":"Sort by",

                                    "text-plancomplete":"Complete",
                                    "text-plancancel":"Delete",
                                    "text-completesign":"Signature",
                                    "text-pleasesign":"Write down member's signature.",
                                    "text-participants":"Participants",

                                    "text-thisgroupmember":"This type's Members",
                                    "text-listloading":"Loading list...",
                                    "text-moveprogram":"Change Program",
                                    "text-memocaution":"This memo is shared with the member.",

                                    "text-deletequestion-plan":"Are you sure to cancel the schedule?",

                                    "text-memberinfo":"Member Info.",
                                    "text-ordernum":"No.",
                                    "text-membername":"Name",
                                    "text-grouptype":"Type",
                                    "text-memberid":"Member's ID",
                                    "text-email":"E-mail",
                                    "text-regcount":"Reg-count",
                                    "text-remaincount":"Rem-count",
                                    "text-startdate":"Start Date",
                                    "text-enddate":"End Date",
                                    "text-contact":"Contact",
                                    "text-manage":"Manage",

                                    "text-refresh":"Refresh",
                                    "text-zoomin":"Zoom in",
                                    "text-zoomout":"Zoom out",
                                    "text-youcan-usecal":"Manage schedule by week calendar",

                                    "text-dd":"Daily", "text-ww":"Weekly", "text-2w":"Bi-weekly",
                                    "text-sunday":"Sunday", "text-monday":"Monday", "text-tuesday":"Tuesday", "text-wednesday":"Wednesday", "text-thursday":"Thursday", "text-friday":"Friday", "text-saturday":"Saturday",
                                    "text-sundaymin":"SUN", "text-mondaymin":"MON", "text-tuesdaymin":"TUE", "text-wednesdaymin":"WED", "text-thursdaymin":"THU", "text-fridaymin":"FRI", "text-saturdaymin":"SAT",

                                    "text-footerdisplay":"none",
                                    "text-company":"About us",
                                    "text-business":"Business",
                                    "text-policy":"Policy",
                                    "text-privacy":"Privacy Policy",
                                    "text-manual":"FAQ"
                                 }
};

//Trainer base - Menu Name
$('.text-hello').text(multi_language_set[Options.language]["text-hello"]);
$('.text-todayplan').text(multi_language_set[Options.language]["text-todayplan"]);
$('.text-plan').text(multi_language_set[Options.language]["text-plan"]);
$('.text-weekplan').text(multi_language_set[Options.language]["text-weekplan"]);
$('.text-monthplan').text(multi_language_set[Options.language]["text-monthplan"]);
$('.text-membermanage').text(multi_language_set[Options.language]["text-membermanage"]);
$('.text-groupmanage').html(multi_language_set[Options.language]["text-groupmanage"]);
$('.text-classmanage').html(multi_language_set[Options.language]["text-classmange"]);
$('.text-centermanage').html(multi_language_set[Options.language]["text-centermanage"]);
$('.text-lecturemanage').text(multi_language_set[Options.language]["text-lecturemanage"]);
$('.text-ticketmanage').text(multi_language_set[Options.language]["text-ticketmanage"]);
$('.text-employeemanage').html(multi_language_set[Options.language]["text-employeemanage"]);
$('.text-workmanage').text(multi_language_set[Options.language]["text-analytics"]);
$('.text-setting').text(multi_language_set[Options.language]["text-setting"]);
$('.text-nameAttach').text(multi_language_set[Options.language]["text-nameAttach"]);
$('.text-logout').text(multi_language_set[Options.language]["text-logout"]);
$('#uptext span').text("님 일정");
$('.text-alarm').text(multi_language_set[Options.language]["text-alarm"]);
$('.text-calSelect').text(multi_language_set[Options.language]["text-programselect"]);
$('.text-mypage').text(multi_language_set[Options.language]["text-mypage"]);
$('.text-help').text(multi_language_set[Options.language]["text-help"]);
$('.text-payment').text(multi_language_set[Options.language]["text-payment"]);
$('.text-moveprogram').text(multi_language_set[Options.language]["text-moveprogram"]);
$('.text-programmanage').text(multi_language_set[Options.language]["text-programmanage"]);
$('.text-memocaution').text(multi_language_set[Options.language]["text-memocaution"]);

//Trainer setting menu
$('.text-basicsetting').text(multi_language_set[Options.language]["text-basicsetting"]);
$('.text-programmanage').text(multi_language_set[Options.language]["text-programmanage"]);
$('.text-reservesetting').text(multi_language_set[Options.language]["text-reservesetting"]);
$('.text-pushsetting').text(multi_language_set[Options.language]["text-pushsetting"]);
$('.text-bgsetting').text(multi_language_set[Options.language]["text-bgsetting"]);
$('.text-purchase').text(multi_language_set[Options.language]["text-purchase"]);
$('.text-language').text(multi_language_set[Options.language]["text-language"]);
$('.text-fromptersteam').text(multi_language_set[Options.language]["text-fromptersteam"]);
$('.text-aboutus').text(multi_language_set[Options.language]["text-aboutus"]);


//Trainer Base - Popups
$('.text-plancomplete').text(multi_language_set[Options.language]["text-plancomplete"]);
$('.text-plancancel').text(multi_language_set[Options.language]["text-plancancel"]);
$('.text-participants').text(multi_language_set[Options.language]["text-participants"]);
$('.text-completesign').text(multi_language_set[Options.language]["text-completesign"]);

$('.text-ok').text(multi_language_set[Options.language]["text-ok"]);
$('.text-cancel').text(multi_language_set[Options.language]["text-cancel"]);
$('.text-delete').text(multi_language_set[Options.language]["text-delete"]);
$('.text-yes').text(multi_language_set[Options.language]["text-yes"]);
$('.text-no').text(multi_language_set[Options.language]["text-no"]);
$('.text-close').text(multi_language_set[Options.language]["text-close"]);
$('.text-register').text(multi_language_set[Options.language]["text-register"]);

$('.text-deletequestion-plan').text(multi_language_set[Options.language]["text-deletequestion-plan"])
$('.text-memberinfo').text(multi_language_set[Options.language]["text-memberinfo"]);
$('.text-thisgroupmember').text(multi_language_set[Options.language]["text-thisgroupmember"]);

//Calendar
$('.text-sundaymin').text(multi_language_set[Options.language]["text-sundaymin"]);
$('.text-mondaymin').text(multi_language_set[Options.language]["text-mondaymin"]);
$('.text-tuesdaymin').text(multi_language_set[Options.language]["text-tuesdaymin"]);
$('.text-wednesdaymin').text(multi_language_set[Options.language]["text-wednesdaymin"]);
$('.text-thursdaymin').text(multi_language_set[Options.language]["text-thursdaymin"]);
$('.text-fridaymin').text(multi_language_set[Options.language]["text-fridaymin"]);
$('.text-saturdaymin').text(multi_language_set[Options.language]["text-saturdaymin"]);
$('.text-refresh').text(multi_language_set[Options.language]["text-refresh"]);
$('.text-zoomout').text(multi_language_set[Options.language]["text-zoomout"]);
$('.text-zoomin').text(multi_language_set[Options.language]["text-zoomin"]);
$('.text-youcan-usecal').text(multi_language_set[Options.language]["text-youcan-usecal"]);
$('.text-today').text(multi_language_set[Options.language]["text-today"]);
$('.text-lessonplan').html(multi_language_set[Options.language]["text-lessonplan"]);
$('.text-offplan').html(multi_language_set[Options.language]["text-offplan"]);
$('.text-addoffplan').text(multi_language_set[Options.language]["text-addoffplan"]);
$('.text-addlessonplan').text(multi_language_set[Options.language]["text-addlessonplan"]);
$('.text-w').text(multi_language_set[Options.language]["text-w"]);
$('.text-m').text(multi_language_set[Options.language]["text-m"]);

//member_manage
$('.text-memberadd').html(multi_language_set[Options.language]["text-memberadd"]);
$('.text-processend').html(multi_language_set[Options.language]["text-processend"]);
$('.text-resume').text(multi_language_set[Options.language]["text-resume"]);
$('.text-refund').text(multi_language_set[Options.language]["text-refund"]);
$('.text-unconnect').text(multi_language_set[Options.language]["text-unconnect"]);
$('.text-connectrequest').text(multi_language_set[Options.language]["text-connectrequest"]);
$('.text-memberadd_full').text(multi_language_set[Options.language]["text-memberadd_full"]);
$('.text-memberreadd').text(multi_language_set[Options.language]["text-memberreadd"]);
$('.text-sort').text(multi_language_set[Options.language]["text-sort"]);
$('.text-ordernum').text(multi_language_set[Options.language]["text-ordernum"]);
$('.text-membername').text(multi_language_set[Options.language]["text-membername"]);
$('.text-grouptype').text(multi_language_set[Options.language]["text-grouptype"]);
$('.text-memberid').text(multi_language_set[Options.language]["text-memberid"]);
$('.text-email').text(multi_language_set[Options.language]["text-email"]);
$('.text-regcount').text(multi_language_set[Options.language]["text-regcount"]);
$('.text-remaincount').text(multi_language_set[Options.language]["text-remaincount"]);
$('.text-startdate').text(multi_language_set[Options.language]["text-startdate"]);
$('.text-enddate').text(multi_language_set[Options.language]["text-enddate"]);
$('.text-contact').text(multi_language_set[Options.language]["text-contact"]);
$('.text-manage').text(multi_language_set[Options.language]["text-manage"]);


//Footer
$('.text-company').text(multi_language_set[Options.language]["text-company"]);
$('.text-business').text(multi_language_set[Options.language]["text-business"]);
$('.text-policy').text(multi_language_set[Options.language]["text-policy"]);
$('.text-privacy').text(multi_language_set[Options.language]["text-privacy"]);
$('.text-manual').text(multi_language_set[Options.language]["text-manual"]);

$('.text-footerdisplay').css('display',multi_language_set[Options.language]["text-footerdisplay"])


//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
