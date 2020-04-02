const TEXT = {
    word:{
        //메뉴들
        menu:{KOR:"전체", EN:"Menu", JP:"メニュー"},
        home:{KOR:"홈", EN:"Home", JP:"ホーム"},
        schedule:{KOR:"일정", EN:"Schedule", JP:"日程"},
        member:{KOR:"회원", EN:"Member", JP:"会員"},
        lecture:{KOR:"수업", EN:"Lecture", JP:"授業"},
        ticket:{KOR:"회원권", EN:"Ticket", JP:"受講券"},
        statistics:{KOR:"통계", EN:"Statistics", JP:"統計"},
        attend_check:{KOR:"출석 체크", EN:"Attend check", JP:"出席チェック"},
        notification:{KOR:"알림", EN:"Notification", JP:"通知"},
        settings:{KOR:"설정", EN:"Settings", JP:"設定"},
        service:{KOR:"서비스", EN:"Service", JP:"サービス"},
        plan_setting:{KOR:"일정 설정", EN:"Calendar Settings", JP:"カレンダー設定"},
        work_time:{KOR:"업무 시간", EN:"Working time", JP:"業務時間"},
        auto_complete:{KOR:"자동 완료", EN:"Auto Complete", JP:"自動完了"},
        member_reserve:{KOR:"회원 예약", EN:"Member Reserve", JP:"会員の予約"},
        attend_mode:{KOR:"출석 체크 모드", EN:"Attend Check Mode", JP:"出席チェックモード"},
        security:{KOR:"정보 보호", EN:"Security", JP:"情報保安"},
        theme:{KOR:"테마", EN:"Theme", JP:"テーマ"},
        notice:{KOR:"공지 사항", EN:"Notice", JP:"お知らせ"},
        inquiry:{KOR:"이용 문의", EN:"Inquiry", JP:"お問い合わせ"},
        manual:{KOR:"사용법", EN:"Manual", JP:"使用法"},
        faq:{KOR:"자주묻는질문", EN:"FAQ", JP:"FAQ"},
        help:{KOR:"도움말", EN:"Help", JP:"ヘルプ"},
        purchase_pters_pass:{KOR:"PTERS패스 구매", EN:"Buy PTERS Pass", JP:"パス購買"},

        //공통
        close:{KOR:"닫기", EN:"Close", JP:"閉じる"},
        done:{KOR:"완료", EN:"Done", JP:"完了"},
        save:{KOR:"저장", EN:"Save", JP:"保存"},
        registration:{KOR:"등록", EN:"Add", JP:"登録"},
        move:{KOR:"이동", EN:"Move", JP:"移動"},
        edit:{KOR:"편집", EN:"Edit", JP:"編集"},
        share:{KOR:"공유", EN:"Sharing", JP:"共有"},
        auth:{KOR:"권한", EN:"Authority", JP:"権限"},

        //홈
        private:{KOR:"개인", EN:"Private", JP:"プライベート"},
        change:{KOR:"변경", EN:"Change", JP:"変更"},
        today_plans:{KOR:"오늘의 일정", EN:"Today's Plan", JP:"今日の日程"},
        today_no_plans:{KOR:"오늘의 일정이 없습니다.", EN:"No plans today", JP:"今日の日程がありません。"},
        hide_show:{KOR:"접기/펼치기", EN:"Hide/Show", JP:""},
        hide:{KOR:"접기", EN:"Hide", JP:"隠す"},
        show:{KOR:"펼치기", EN:"Show", JP:"開く"},
        expiration_alert:{KOR:"종료 임박 회원", EN:"Contract Expiration", JP:"終了が近い会員"},
        sales_of_this_month:{KOR:"이번달 매출", EN:"Sales of this month", JP:"今月のセールス"},
        my_using_pters_pass:{KOR:"이용 중인 PTERS 패스", EN:"My PTERS Pass", JP:"My PTERS Pass"},        

        //일정
        monthly_calendar:{KOR:"월간 달력", EN:"Monthly Calendar", JP:"月間"},
        weekly_calendar:{KOR:"주간 달력", EN:"Weekly Calendar", JP:"週間"},
        repeat_schedule_list:{KOR:"반복 일정 목록", EN:"Repeat schedule list", JP:"繰り返しリスト"},
        // permission_wait_schedule_list:{KOR:"예약 대기 일정 리스트", EN:"Repeat schedule list", JP:"繰り返しリスト"},
        am:{KOR:"오전", EN:"AM", JP:"午前"},
        pm:{KOR:"오후", EN:"PM", JP:"午後"},

        new_schedule:{KOR:"새로운 일정", EN:"New schedule", JP:"新しい日程"},
        date:{KOR:"일자", EN:"Date", JP:"日付"},
        time:{KOR:"시간", EN:"Time", JP:"時間"},
        repeat:{KOR:"반복", EN:"Repeat", JP:"繰り返し"},
        memo:{KOR:"메모", EN:"Memo", JP:"メモ―"},


        //지점
        program:{KOR:"지점", EN:"Program", JP:"プログラム"},
        selected_program:{KOR:"선택된 지점", EN:"Selected", JP:"現在"},
        shared_program:{KOR:"공유 받은 지점", EN:"Shared", JP:"共有されている"},
        my_program:{KOR:"내 지점", EN:"My programs", JP:"マイ"},
        no_shared_programs:{
            KOR:"다른 PTERS 강사님으로부터 공유 받은 지점이 없습니다.",
            EN:"Any shared programs from the other PTERS teachers.", 
            JP:"他のPTERSユーザから共有してもらったプログラムがありません。"},
        sharing_my_programs:{
            KOR:"다른 PTERS 강사님께 내 지점을 공유하여, 함께 관리합니다.",
            EN:"Sharing my program to the other PTERS teachers to manage together.", 
            JP:"他のPTERSユーザに自分のプログラムを共有して、一緒に管理します。"},
        
        // 지점 추가
        new_program:{KOR:"새로운 지점", EN:"New program", JP:"新しいプログラム"},
        program_name:{KOR:"지점명", EN:"Program name", JP:"プログラム名"},
        field:{KOR:"분야", EN:"Field", JP:"分野"},
        sub_field:{KOR:"상세 분야", EN:"Field Detail", JP:"詳細分野"},
        please_select_field:{
            KOR:"분야를 선택해주세요.", 
            EN:"Please select the field.", 
            JP:"分野を選択してください。"},
        please_select_detail_field:{
            KOR:"상세 분야를 선택해주세요.", 
            EN:"Please select the detail field.", 
            JP:"詳細分野を選択してください。"},

        // 공통
        rem:{KOR:"잔여", EN:"Left", JP:"残余"},
        reg:{KOR:"등록", EN:"Reg.", JP:"登録"},
        rem_count:{KOR:"잔여 횟수", EN:"Left", JP:"残余回数"},
        reg_count:{KOR:"등록 횟수", EN:"Registered", JP:"登録回数"},
        count_limitless:{KOR:"무제한", EN:"Limitless", JP:"無制限"},
        date_limitless:{KOR:"소진시 까지", EN:"No end date", JP:"制限無し"},
        date_passed:{KOR:"지남", EN:"passed", JP:"過"},
        date_left:{KOR:"남음", EN:"left", JP:"残"},
    },
    message:{
        loading:{
            KOR:"사용자 데이터를 불러오고 있습니다.",
            EN:"",
            JP:""
        },
        ajax_error:{
            KOR:"통신 오류 발생 \n 잠시후 다시 시도해주세요.",
            EN:"",
            JP:""
        }
    },
    unit:{
        money:{KOR:"원", EN:"$", JP:"円"},
        count:{ KOR:"회", EN:"", JP:"回"},
        year:{KOR:"년", EN:".", JP:"年"},
        month:{KOR:"월", EN:".", JP:"月"},
        date:{KOR:"일", EN:".", JP:"日"},
        date_text:{KOR:"일", EN:"day.", JP:"日"},
        person:{KOR:"명", EN:"", JP:"名"},
    }
};