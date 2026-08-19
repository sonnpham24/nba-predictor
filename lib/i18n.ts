export type Locale = 'en' | 'vi';

export const translations = {
  en: {
    // Navigation
    navBrand: 'NBA PREDICTOR',
    navSub: '2025 SEASON HUB',
    navRegular: '🏀 Regular Season',
    navPlayoffs: '🏆 Playoffs',
    navPlayoffsLocked: 'Coming Soon',
    navPlayoffsLockedTooltip: 'Playoffs haven\'t started yet!',
    navLeaderboard: '📊 Leaderboard',
    navAdmin: '⚙️ Admin Panel',
    navLogin: 'Sign In',
    navLogout: 'Sign Out',
    proAdmin: 'PRO ADMIN',

    // Landing Page
    landingTitle: 'THE ULTIMATE NBA PREDICTION PLATFORM',
    landingSub: 'Predict daily NBA matchups, follow live game scores, rate community odds, and climb the global leaderboard.',
    landingBtnStart: 'Get Started Free',
    landingBtnSignIn: 'Sign In to Play',
    landingFeat1Title: 'Live Regular Season Matchups',
    landingFeat1Desc: 'Real-time scores, period clock tracking, and daily game schedule up to 7 days ahead.',
    landingFeat2Title: 'Community Predictions & Odds',
    landingFeat2Desc: 'Vote for winning teams, view real-time community voting percentages, and compare odds.',
    landingFeat3Title: 'Automated Scoring & Leaderboard',
    landingFeat3Desc: 'Auto-settled predictions when games finish. Earn +1 point per correct pick and top the standings.',

    // Regular Season Page
    regularTitle: 'NBA REGULAR SEASON PREDICTOR',
    regularSub: 'Predict winning teams, follow live game scores, and check community voting split.',
    today: 'Today',
    tomorrow: 'Tomorrow',
    inDays: 'Days',
    predictOpen: 'Prediction Open',
    predictLocked: 'Locked (30m before tip-off)',
    finished: 'FINISHED',
    live: 'LIVE',
    scheduled: 'SCHEDULED',
    voteFor: 'Vote',
    voted: 'Voted',
    details: 'View Match Details →',
    noGamesOnDate: 'No NBA matchups scheduled for this date.',

    // Matchup Detail
    matchupDetailTitle: 'NBA Matchup Breakdown',
    votingSplit: '📊 Community Voting Split',
    totalPredictions: 'total user predictions',
    yourPrediction: '🗳️ Your Prediction (+1 point if correct pick)',
    recentPredictors: 'Recent Community Predictors',

    // Team Detail
    teamDetailTitle: 'Team Overview',
    conference: 'Conference',
    coach: 'Head Coach',
    verifiedRoster: '✅ Verified Official NBA Roster',
    pendingRoster: '⏳ Pending Admin Verification',
    rosterTableTitle: '🏀 Official Player Roster',
    player: 'Player',
    jersey: 'Jersey #',
    position: 'Position',
    height: 'Height',
    weight: 'Weight',

    // Leaderboard
    leaderboardTitle: '📊 GLOBAL LEADERBOARD',
    leaderboardSub: 'Honoring top predictors in NBA Predictor 2025 (Combined Total Score)',
    totalScore: 'Total Score',
    regularPoints: 'Regular Pts',
    playoffPoints: 'Playoff Pts',
    rank: 'Rank',
    user: 'Predictor',
    correctPicks: 'Correct Picks',
    totalPicks: 'Total Picks',

    // Auth
    authSignInTitle: 'SIGN IN',
    authSignUpTitle: 'CREATE ACCOUNT',
    authSignInSub: 'Welcome back to NBA Predictor Hub',
    authSignUpSub: 'Join the NBA 2025 prediction community',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username...',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password...',
    btnSignInAction: 'SIGN IN NOW →',
    btnSignUpAction: 'CONFIRM REGISTRATION →',

    // Footer
    copyright: 'Copyright © NBA Predictor 2025 - All Rights Reserved.',
  },
  vi: {
    // Navigation
    navBrand: 'NBA PREDICTOR',
    navSub: '2025 SEASON HUB',
    navRegular: '🏀 Regular Season',
    navPlayoffs: '🏆 Playoffs',
    navPlayoffsLocked: 'Sắp ra mắt',
    navPlayoffsLockedTooltip: 'Chưa tới mùa giải Playoff!',
    navLeaderboard: '📊 Bảng Xếp Hạng',
    navAdmin: '⚙️ Admin Panel',
    navLogin: 'Đăng nhập',
    navLogout: 'Đăng xuất',
    proAdmin: 'PRO ADMIN',

    // Landing Page
    landingTitle: 'NỀN TẢNG DỰ ĐOÁN KẾT QUẢ NBA HÀNG ĐẦU',
    landingSub: 'Dự đoán kết quả từng trận đấu NBA, theo dõi tỉ số Live real-time, đánh giá tỷ lệ cộng đồng và vinh danh trên Bảng Xếp Hạng.',
    landingBtnStart: 'Bắt Đầu Ngay (Miễn Phí)',
    landingBtnSignIn: 'Đăng Nhập Để Chơi',
    landingFeat1Title: 'Lịch Thi Đấu & Tỉ Số Live',
    landingFeat1Desc: 'Tỉ số thực tế, đồng hồ thời gian còn lại, và lịch thi đấu chuẩn trong vòng 7 ngày.',
    landingFeat2Title: 'Dự Đoán & Tỷ Lệ Cộng Đồng',
    landingFeat2Desc: 'Bình chọn đội thắng, xem phần trăm tỷ lệ bình chọn của người chơi khác và so sánh.',
    landingFeat3Title: 'Tự Động Chấm Điểm & Vinh Danh',
    landingFeat3Desc: 'Tự động tính điểm +1 khi trận đấu kết thúc và cập nhật Bảng Xếp Hạng toàn cầu.',

    // Regular Season Page
    regularTitle: 'DỰ ĐOÁN NBA REGULAR SEASON',
    regularSub: 'Bình chọn đội thắng, theo dõi tỉ số trực tiếp và tỉ lệ bình chọn cộng đồng.',
    today: 'Hôm nay',
    tomorrow: 'Ngày mai',
    inDays: 'Ngày',
    predictOpen: 'Đang mở dự đoán',
    predictLocked: 'Đã khóa (30 phút trước giờ đấu)',
    finished: 'ĐÃ KẾT THÚC',
    live: 'TRỰC TIẾP',
    scheduled: 'SẮP DIỄN RA',
    voteFor: 'Chọn',
    voted: 'Đã chọn',
    details: 'Xem Chi Tiết Matchup →',
    noGamesOnDate: 'Không có trận đấu NBA nào trong ngày này.',

    // Matchup Detail
    matchupDetailTitle: 'Chi Tiết Trận Đấu NBA',
    votingSplit: '📊 Tỷ Lệ Bình Chọn Cộng Đồng',
    totalPredictions: 'tổng lượt dự đoán',
    yourPrediction: '🗳️ Dự đoán của bạn (+1 điểm nếu đúng đội thắng)',
    recentPredictors: 'Người dùng vừa bình chọn gần đây',

    // Team Detail
    teamDetailTitle: 'Thông Tin Đội Bóng',
    conference: 'Khu vực / Miền',
    coach: 'Huấn luyện viên',
    verifiedRoster: '✅ Thông tin Roster chính thức đã duyệt',
    pendingRoster: '⏳ Đang chờ Admin duyệt dữ liệu chi tiết',
    rosterTableTitle: '🏀 Danh Sách Cầu Thủ (Roster)',
    player: 'Cầu thủ',
    jersey: 'Số áo',
    position: 'Vị trí',
    height: 'Chiều cao',
    weight: 'Cân nặng',

    // Leaderboard
    leaderboardTitle: '📊 BẢNG XẾP HẠNG TOÀN CẦU',
    leaderboardSub: 'Vinh danh cao thủ có Điểm Tổng cao nhất NBA Predictor 2025',
    totalScore: 'Điểm Tổng',
    regularPoints: 'Điểm Regular',
    playoffPoints: 'Điểm Playoff',
    rank: 'Thứ hạng',
    user: 'Người chơi',
    correctPicks: 'Đoán đúng',
    totalPicks: 'Tổng lượt đoán',

    // Auth
    authSignInTitle: 'ĐĂNG NHẬP',
    authSignUpTitle: 'TẠO TÀI KHOẢN',
    authSignInSub: 'Chào mừng bạn trở lại với NBA Predictor Hub',
    authSignUpSub: 'Tham gia cộng đồng dự đoán kết quả NBA 2025',
    usernameLabel: 'Tên tài khoản (Username)',
    usernamePlaceholder: 'Nhập username của bạn...',
    passwordLabel: 'Mật khẩu (Password)',
    passwordPlaceholder: 'Nhập mật khẩu...',
    btnSignInAction: 'VÀO HỆ THỐNG →',
    btnSignUpAction: 'XÁC NHẬN ĐĂNG KÝ →',

    // Footer
    copyright: 'Bản quyền © NBA Predictor 2025 - Đã đăng ký bản quyền.',
  },
};
