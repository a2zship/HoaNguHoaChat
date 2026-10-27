/*
 * Bộ từ vựng tiếng Trung ngành hóa chất & xuất nhập khẩu.
 * Mỗi từ: [chữ Hán, pinyin có dấu thanh, nghĩa tiếng Việt, (tuỳ chọn) ví dụ "Hán|pinyin|nghĩa"].
 * Muốn thêm từ: thêm một dòng vào đúng chủ đề, giữ đúng thứ tự 3–4 phần tử. Mã từ (id) được sinh tự động
 * theo chủ đề + vị trí, nên CHỈ THÊM VÀO CUỐI chủ đề để không lệch tiến độ học đã lưu.
 * Lưu ý: bản soạn đầu, nên nhờ người dùng tiếng Trung thành thạo trong ngành rà lại trước khi dạy rộng.
 */
(function (root) {
  var TOPICS = [
    { id: "hoa-chat", ten: "Tên hóa chất thông dụng", mota: "Axit, kiềm, dung môi, phụ gia, Sorbitol…", icon: "flask" },
    { id: "thong-so", ten: "Thông số & chất lượng", mota: "Độ tinh khiết, hàm lượng, COA, cấp thực phẩm…", icon: "gauge" },
    { id: "an-toan", ten: "An toàn & hàng nguy hiểm", mota: "MSDS, số UN, dễ cháy, ăn mòn, bảo quản…", icon: "shield" },
    { id: "dong-goi", ten: "Đóng gói", mota: "Phuy, IBC, bao jumbo, pallet, ký mã hiệu…", icon: "package" },
    { id: "bao-gia", ten: "Hỏi giá & báo giá", mota: "Báo giá, MOQ, hàng có sẵn, thời gian giao…", icon: "tag" },
    { id: "hop-dong", ten: "Hợp đồng & đặt hàng", mota: "PI, điều khoản, đóng dấu, đại lý…", icon: "file" },
    { id: "thanh-toan", ten: "Thanh toán", mota: "T/T, L/C, đặt cọc, D/P, tỷ giá…", icon: "wallet" },
    { id: "incoterms", ten: "Điều kiện giao hàng", mota: "EXW, FOB, CFR, CIF, DDP, cảng đi/đến…", icon: "globe" },
    { id: "van-tai", ten: "Vận tải & logistics", mota: "Forwarder, đặt tàu, container, cửa khẩu…", icon: "ship" },
    { id: "chung-tu", ten: "Chứng từ & hải quan", mota: "B/L, C/O form E, HS code, thông quan…", icon: "stamp" },
    { id: "khieu-nai", ten: "Khiếu nại & sau bán", mota: "Thiếu cân, vón cục, bồi thường, giám định…", icon: "alert" },
    { id: "giao-tiep", ten: "Giao tiếp công việc", mota: "Chào hỏi, WeChat, hợp tác, thăm nhà máy…", icon: "chat" }
  ];

  var RAW = {
    "hoa-chat": [
      ["化学品", "huàxuépǐn", "Hóa chất", "我们公司主要进口化学品。|Wǒmen gōngsī zhǔyào jìnkǒu huàxuépǐn.|Công ty chúng tôi chủ yếu nhập khẩu hóa chất."],
      ["化工", "huàgōng", "Ngành hóa chất / hóa công", "他在化工行业工作了十年。|Tā zài huàgōng hángyè gōngzuò le shí nián.|Anh ấy làm trong ngành hóa chất mười năm rồi."],
      ["原料", "yuánliào", "Nguyên liệu", "这是食品厂用的原料。|Zhè shì shípǐnchǎng yòng de yuánliào.|Đây là nguyên liệu nhà máy thực phẩm dùng."],
      ["山梨醇", "shānlíchún", "Sorbitol", "山梨醇液体的含量是百分之七十。|Shānlíchún yètǐ de hánliàng shì bǎi fēn zhī qīshí.|Sorbitol lỏng có hàm lượng 70%."],
      ["氢氧化钠", "qīngyǎnghuànà", "Natri hydroxit (NaOH, xút)"],
      ["烧碱", "shāojiǎn", "Xút ăn da (tên thường gọi của NaOH)", "片碱和液碱都是烧碱。|Piànjiǎn hé yèjiǎn dōu shì shāojiǎn.|Xút vảy và xút lỏng đều là xút ăn da."],
      ["硫酸", "liúsuān", "Axit sunfuric (H₂SO₄)"],
      ["盐酸", "yánsuān", "Axit clohydric (HCl)"],
      ["硝酸", "xiāosuān", "Axit nitric (HNO₃)"],
      ["磷酸", "línsuān", "Axit photphoric (H₃PO₄)"],
      ["柠檬酸", "níngméngsuān", "Axit citric", "柠檬酸有无水和一水两种。|Níngméngsuān yǒu wúshuǐ hé yīshuǐ liǎng zhǒng.|Axit citric có hai loại: khan và ngậm một nước."],
      ["乙酸", "yǐsuān", "Axit axetic (còn gọi 醋酸 cùsuān)"],
      ["双氧水", "shuāngyǎngshuǐ", "Oxy già (H₂O₂)"],
      ["甘油", "gānyóu", "Glycerin"],
      ["乙醇", "yǐchún", "Etanol (cồn)"],
      ["甲醇", "jiǎchún", "Metanol"],
      ["纯碱", "chúnjiǎn", "Soda (Na₂CO₃)"],
      ["碳酸氢钠", "tànsuānqīngnà", "Natri bicacbonat (NaHCO₃, bột nở)"],
      ["氯化钠", "lǜhuànà", "Natri clorua (NaCl, muối)"],
      ["次氯酸钠", "cìlǜsuānnà", "Natri hypoclorit (NaClO, nước Javen)"],
      ["聚合氯化铝", "jùhé lǜhuàlǚ", "PAC (poly nhôm clorua, xử lý nước)"],
      ["葡萄糖", "pútáotáng", "Glucose (đường gluco)"],
      ["麦芽糊精", "màiyá hújīng", "Maltodextrin"],
      ["淀粉", "diànfěn", "Tinh bột"],
      ["溶剂", "róngjì", "Dung môi"],
      ["添加剂", "tiānjiājì", "Phụ gia", "这个添加剂可以用在食品里吗？|Zhège tiānjiājì kěyǐ yòng zài shípǐn lǐ ma?|Phụ gia này có dùng trong thực phẩm được không?"],
      ["防腐剂", "fángfǔjì", "Chất bảo quản"],
      ["甜味剂", "tiánwèijì", "Chất tạo ngọt"]
    ],
    "thong-so": [
      ["规格", "guīgé", "Quy cách / thông số kỹ thuật", "请发一下这个产品的规格。|Qǐng fā yīxià zhège chǎnpǐn de guīgé.|Vui lòng gửi thông số kỹ thuật của sản phẩm này."],
      ["纯度", "chúndù", "Độ tinh khiết", "纯度不低于百分之九十九。|Chúndù bù dī yú bǎi fēn zhī jiǔshíjiǔ.|Độ tinh khiết không thấp hơn 99%."],
      ["含量", "hánliàng", "Hàm lượng", "固含量是多少？|Gù hánliàng shì duōshao?|Hàm lượng chất rắn là bao nhiêu?"],
      ["水分", "shuǐfèn", "Độ ẩm / hàm lượng nước"],
      ["密度", "mìdù", "Tỷ trọng / khối lượng riêng"],
      ["粘度", "niándù", "Độ nhớt"],
      ["pH值", "pH zhí", "Độ pH"],
      ["熔点", "róngdiǎn", "Điểm nóng chảy"],
      ["沸点", "fèidiǎn", "Điểm sôi"],
      ["闪点", "shǎndiǎn", "Điểm chớp cháy"],
      ["外观", "wàiguān", "Ngoại quan (hình thức bên ngoài)"],
      ["无色透明液体", "wúsè tòumíng yètǐ", "Chất lỏng trong suốt không màu"],
      ["白色粉末", "báisè fěnmò", "Bột màu trắng"],
      ["结晶", "jiéjīng", "Tinh thể / kết tinh"],
      ["杂质", "zázhì", "Tạp chất"],
      ["重金属", "zhòngjīnshǔ", "Kim loại nặng"],
      ["食品级", "shípǐnjí", "Cấp thực phẩm (food grade)", "我们要的是食品级，不是工业级。|Wǒmen yào de shì shípǐnjí, bú shì gōngyèjí.|Chúng tôi cần cấp thực phẩm, không phải cấp công nghiệp."],
      ["工业级", "gōngyèjí", "Cấp công nghiệp (industrial grade)"],
      ["医药级", "yīyàojí", "Cấp dược (pharma grade)"],
      ["分析证书", "fēnxī zhèngshū", "Giấy chứng nhận phân tích (COA)", "每批货都要附上分析证书。|Měi pī huò dōu yào fù shàng fēnxī zhèngshū.|Mỗi lô hàng đều phải kèm COA."],
      ["检测报告", "jiǎncè bàogào", "Báo cáo kiểm nghiệm"],
      ["样品", "yàngpǐn", "Hàng mẫu", "可以先寄一公斤样品吗？|Kěyǐ xiān jì yī gōngjīn yàngpǐn ma?|Có thể gửi trước 1 kg hàng mẫu không?"],
      ["保质期", "bǎozhìqī", "Hạn sử dụng", "保质期是两年。|Bǎozhìqī shì liǎng nián.|Hạn sử dụng là hai năm."],
      ["生产日期", "shēngchǎn rìqī", "Ngày sản xuất"],
      ["批号", "pīhào", "Số lô"],
      ["标准", "biāozhǔn", "Tiêu chuẩn"],
      ["合格", "hégé", "Đạt (đạt tiêu chuẩn)"]
    ],
    "an-toan": [
      ["安全技术说明书", "ānquán jìshù shuōmíngshū", "Bảng chỉ dẫn an toàn hóa chất (MSDS/SDS)", "请提供英文版的安全技术说明书。|Qǐng tígōng Yīngwén bǎn de ānquán jìshù shuōmíngshū.|Vui lòng cung cấp MSDS bản tiếng Anh."],
      ["危险品", "wēixiǎnpǐn", "Hàng nguy hiểm (DG)", "这个产品是危险品吗？|Zhège chǎnpǐn shì wēixiǎnpǐn ma?|Sản phẩm này có phải hàng nguy hiểm không?"],
      ["危险等级", "wēixiǎn děngjí", "Cấp nguy hiểm (class)"],
      ["联合国编号", "liánhéguó biānhào", "Số UN"],
      ["易燃", "yìrán", "Dễ cháy"],
      ["腐蚀性", "fǔshíxìng", "Tính ăn mòn"],
      ["有毒", "yǒudú", "Độc hại"],
      ["易爆", "yìbào", "Dễ nổ"],
      ["氧化剂", "yǎnghuàjì", "Chất oxy hóa"],
      ["普通货物", "pǔtōng huòwù", "Hàng thường (không nguy hiểm)", "山梨醇是普通货物，不是危险品。|Shānlíchún shì pǔtōng huòwù, bú shì wēixiǎnpǐn.|Sorbitol là hàng thường, không phải hàng nguy hiểm."],
      ["防护手套", "fánghù shǒutào", "Găng tay bảo hộ"],
      ["储存", "chǔcún", "Bảo quản / lưu kho"],
      ["阴凉干燥处", "yīnliáng gānzào chù", "Nơi khô ráo, thoáng mát", "请储存在阴凉干燥处。|Qǐng chǔcún zài yīnliáng gānzào chù.|Vui lòng bảo quản nơi khô ráo, thoáng mát."],
      ["避光", "bìguāng", "Tránh ánh sáng"],
      ["泄漏", "xièlòu", "Rò rỉ"],
      ["标签", "biāoqiān", "Nhãn"],
      ["鉴定报告", "jiàndìng bàogào", "Báo cáo giám định (điều kiện vận chuyển)"]
    ],
    "dong-goi": [
      ["包装", "bāozhuāng", "Đóng gói / bao bì", "包装是什么样的？|Bāozhuāng shì shénmeyàng de?|Đóng gói như thế nào?"],
      ["桶", "tǒng", "Thùng / phuy"],
      ["塑料桶", "sùliào tǒng", "Phuy nhựa", "二百五十公斤塑料桶包装。|Èrbǎi wǔshí gōngjīn sùliào tǒng bāozhuāng.|Đóng phuy nhựa 250 kg."],
      ["铁桶", "tiětǒng", "Phuy sắt"],
      ["吨桶", "dūntǒng", "Bồn IBC (1 tấn)"],
      ["吨袋", "dūndài", "Bao jumbo (bao tấn)"],
      ["编织袋", "biānzhīdài", "Bao dệt PP"],
      ["内衬", "nèichèn", "Lớp lót trong (túi PE lót)"],
      ["净重", "jìngzhòng", "Trọng lượng tịnh (N.W.)"],
      ["毛重", "máozhòng", "Trọng lượng cả bì (G.W.)"],
      ["托盘", "tuōpán", "Pallet"],
      ["唛头", "màitóu", "Ký mã hiệu (shipping mark)", "唛头请按我们的要求印。|Màitóu qǐng àn wǒmen de yāoqiú yìn.|Ký mã hiệu vui lòng in theo yêu cầu của chúng tôi."],
      ["散装", "sǎnzhuāng", "Hàng rời (không đóng bao)"],
      ["公斤", "gōngjīn", "Kilogam (kg)"],
      ["吨", "dūn", "Tấn"],
      ["体积", "tǐjī", "Thể tích"],
      ["缠绕膜", "chánràomó", "Màng quấn pallet"]
    ],
    "bao-gia": [
      ["询价", "xúnjià", "Hỏi giá", "我想询价一下山梨醇。|Wǒ xiǎng xúnjià yīxià shānlíchún.|Tôi muốn hỏi giá Sorbitol."],
      ["报价", "bàojià", "Báo giá", "请报一个到胡志明港的价格。|Qǐng bào yí ge dào Húzhìmíng gǎng de jiàgé.|Vui lòng báo giá đến cảng Hồ Chí Minh."],
      ["报价单", "bàojiàdān", "Bảng báo giá"],
      ["单价", "dānjià", "Đơn giá"],
      ["总价", "zǒngjià", "Tổng giá"],
      ["最低起订量", "zuìdī qǐdìngliàng", "Số lượng đặt hàng tối thiểu (MOQ)", "最低起订量是一个整柜。|Zuìdī qǐdìngliàng shì yí ge zhěngguì.|MOQ là một container nguyên."],
      ["有效期", "yǒuxiàoqī", "Thời hạn hiệu lực", "这个报价有效期七天。|Zhège bàojià yǒuxiàoqī qī tiān.|Báo giá này có hiệu lực 7 ngày."],
      ["优惠", "yōuhuì", "Ưu đãi"],
      ["折扣", "zhékòu", "Chiết khấu"],
      ["价格波动", "jiàgé bōdòng", "Giá biến động"],
      ["市场价", "shìchǎngjià", "Giá thị trường"],
      ["现货", "xiànhuò", "Hàng có sẵn", "现在有现货吗？|Xiànzài yǒu xiànhuò ma?|Hiện có hàng sẵn không?"],
      ["期货", "qīhuò", "Hàng giao kỳ hạn (phải chờ sản xuất)"],
      ["交货期", "jiāohuòqī", "Thời gian giao hàng", "交货期大概多久？|Jiāohuòqī dàgài duōjiǔ?|Thời gian giao hàng khoảng bao lâu?"],
      ["产能", "chǎnnéng", "Công suất sản xuất"],
      ["供应商", "gōngyìngshāng", "Nhà cung cấp"],
      ["采购", "cǎigòu", "Thu mua / mua hàng"],
      ["还价", "huánjià", "Trả giá (mặc cả)"],
      ["含税", "hánshuì", "Đã gồm thuế"],
      ["不含税", "bù hánshuì", "Chưa gồm thuế"]
    ],
    "hop-dong": [
      ["合同", "hétong", "Hợp đồng", "合同已经发到您的邮箱了。|Hétong yǐjīng fā dào nín de yóuxiāng le.|Hợp đồng đã gửi vào email của anh/chị rồi."],
      ["签合同", "qiān hétong", "Ký hợp đồng"],
      ["订单", "dìngdān", "Đơn đặt hàng"],
      ["下单", "xiàdān", "Đặt hàng (chốt đơn)", "我们下周下单。|Wǒmen xià zhōu xiàdān.|Tuần sau chúng tôi đặt hàng."],
      ["形式发票", "xíngshì fāpiào", "Hóa đơn chiếu lệ (PI)"],
      ["条款", "tiáokuǎn", "Điều khoản"],
      ["数量", "shùliàng", "Số lượng"],
      ["违约", "wéiyuē", "Vi phạm hợp đồng"],
      ["不可抗力", "bùkěkànglì", "Bất khả kháng"],
      ["盖章", "gàizhāng", "Đóng dấu", "请签字盖章后回传。|Qǐng qiānzì gàizhāng hòu huíchuán.|Vui lòng ký tên đóng dấu rồi gửi lại."],
      ["确认", "quèrèn", "Xác nhận"],
      ["修改", "xiūgǎi", "Sửa đổi"],
      ["代理", "dàilǐ", "Đại lý"],
      ["独家代理", "dújiā dàilǐ", "Đại lý độc quyền"],
      ["经销商", "jīngxiāoshāng", "Nhà phân phối"]
    ],
    "thanh-toan": [
      ["付款方式", "fùkuǎn fāngshì", "Phương thức thanh toán", "付款方式是电汇还是信用证？|Fùkuǎn fāngshì shì diànhuì háishi xìnyòngzhèng?|Thanh toán bằng T/T hay L/C?"],
      ["电汇", "diànhuì", "Chuyển tiền điện (T/T)"],
      ["信用证", "xìnyòngzhèng", "Thư tín dụng (L/C)"],
      ["即期信用证", "jíqī xìnyòngzhèng", "L/C trả ngay (at sight)"],
      ["远期", "yuǎnqī", "Trả chậm (kỳ hạn)"],
      ["预付款", "yùfùkuǎn", "Tiền trả trước"],
      ["定金", "dìngjīn", "Tiền đặt cọc", "百分之三十定金，余款见提单副本付清。|Bǎi fēn zhī sānshí dìngjīn, yúkuǎn jiàn tídān fùběn fùqīng.|Cọc 30%, phần còn lại trả hết khi thấy bản sao B/L."],
      ["尾款", "wěikuǎn", "Tiền còn lại (phần cuối)"],
      ["提单副本", "tídān fùběn", "Bản sao vận đơn (copy B/L)"],
      ["付款交单", "fùkuǎn jiāodān", "Nhờ thu trả tiền đổi chứng từ (D/P)"],
      ["承兑交单", "chéngduì jiāodān", "Nhờ thu chấp nhận đổi chứng từ (D/A)"],
      ["汇率", "huìlǜ", "Tỷ giá"],
      ["美元", "měiyuán", "Đô la Mỹ (USD)"],
      ["人民币", "rénmínbì", "Nhân dân tệ (CNY)"],
      ["银行", "yínháng", "Ngân hàng"],
      ["水单", "shuǐdān", "Chứng từ chuyển tiền (bank slip)", "钱已经付了，这是水单。|Qián yǐjīng fù le, zhè shì shuǐdān.|Tiền đã chuyển rồi, đây là chứng từ chuyển tiền."],
      ["开证行", "kāizhèngháng", "Ngân hàng phát hành L/C"]
    ],
    "incoterms": [
      ["贸易术语", "màoyì shùyǔ", "Điều kiện thương mại (Incoterms)"],
      ["工厂交货", "gōngchǎng jiāohuò", "Giao tại xưởng (EXW)"],
      ["离岸价", "lí'ànjià", "Giá FOB (giao lên tàu)", "离岸价是多少？|Lí'ànjià shì duōshao?|Giá FOB là bao nhiêu?"],
      ["成本加运费", "chéngběn jiā yùnfèi", "Tiền hàng + cước (CFR)"],
      ["到岸价", "dào'ànjià", "Giá CIF (gồm cước + bảo hiểm)", "请报到岸价，目的港胡志明。|Qǐng bào dào'ànjià, mùdìgǎng Húzhìmíng.|Vui lòng báo giá CIF, cảng đến Hồ Chí Minh."],
      ["完税后交货", "wánshuì hòu jiāohuò", "Giao hàng đã nộp thuế (DDP)"],
      ["起运港", "qǐyùngǎng", "Cảng đi (POL)"],
      ["目的港", "mùdìgǎng", "Cảng đến (POD)"],
      ["保险", "bǎoxiǎn", "Bảo hiểm"],
      ["风险转移", "fēngxiǎn zhuǎnyí", "Chuyển giao rủi ro"]
    ],
    "van-tai": [
      ["货代", "huòdài", "Công ty giao nhận (forwarder)", "我们有指定的货代。|Wǒmen yǒu zhǐdìng de huòdài.|Chúng tôi có forwarder chỉ định."],
      ["订舱", "dìngcāng", "Đặt chỗ tàu (booking)"],
      ["船期", "chuánqī", "Lịch tàu"],
      ["海运", "hǎiyùn", "Vận tải đường biển"],
      ["陆运", "lùyùn", "Vận tải đường bộ"],
      ["集装箱", "jízhuāngxiāng", "Container"],
      ["二十尺柜", "èrshí chǐ guì", "Container 20 feet", "一个二十尺柜可以装多少吨？|Yí ge èrshí chǐ guì kěyǐ zhuāng duōshao dūn?|Một container 20 feet đóng được bao nhiêu tấn?"],
      ["整柜", "zhěngguì", "Hàng nguyên container (FCL)"],
      ["拼箱", "pīnxiāng", "Hàng ghép container (LCL)"],
      ["装柜", "zhuāngguì", "Đóng hàng vào container"],
      ["开船", "kāichuán", "Tàu chạy (ngày tàu khởi hành)", "预计下周三开船。|Yùjì xià zhōusān kāichuán.|Dự kiến thứ Tư tuần sau tàu chạy."],
      ["到港", "dàogǎng", "Hàng đến cảng"],
      ["运费", "yùnfèi", "Cước vận chuyển"],
      ["滞港费", "zhìgǎngfèi", "Phí lưu container/lưu bãi tại cảng"],
      ["跟踪", "gēnzōng", "Theo dõi (tracking)"],
      ["边境", "biānjìng", "Biên giới"],
      ["凭祥", "Píngxiáng", "Bằng Tường (cửa khẩu đối diện Lạng Sơn)"],
      ["友谊关", "Yǒuyìguān", "Hữu Nghị Quan (cửa khẩu Hữu Nghị)"]
    ],
    "chung-tu": [
      ["单证", "dānzhèng", "Chứng từ", "单证要和信用证一致。|Dānzhèng yào hé xìnyòngzhèng yízhì.|Chứng từ phải khớp với L/C."],
      ["提单", "tídān", "Vận đơn (B/L)"],
      ["商业发票", "shāngyè fāpiào", "Hóa đơn thương mại (Commercial Invoice)"],
      ["装箱单", "zhuāngxiāngdān", "Phiếu đóng gói (Packing List)"],
      ["原产地证", "yuánchǎndìzhèng", "Giấy chứng nhận xuất xứ (C/O)"],
      ["E表", "E biǎo", "C/O form E (ASEAN–Trung Quốc)", "请办E表，我们可以减免关税。|Qǐng bàn E biǎo, wǒmen kěyǐ jiǎnmiǎn guānshuì.|Vui lòng làm form E, chúng tôi được giảm miễn thuế nhập khẩu."],
      ["报关", "bàoguān", "Khai hải quan"],
      ["清关", "qīngguān", "Thông quan"],
      ["海关", "hǎiguān", "Hải quan"],
      ["关税", "guānshuì", "Thuế quan / thuế nhập khẩu"],
      ["增值税", "zēngzhíshuì", "Thuế giá trị gia tăng (VAT)"],
      ["海关编码", "hǎiguān biānmǎ", "Mã HS", "这个产品的海关编码是多少？|Zhège chǎnpǐn de hǎiguān biānmǎ shì duōshao?|Mã HS của sản phẩm này là bao nhiêu?"],
      ["进口", "jìnkǒu", "Nhập khẩu"],
      ["出口", "chūkǒu", "Xuất khẩu"],
      ["进出口", "jìnchūkǒu", "Xuất nhập khẩu"],
      ["查验", "cháyàn", "Kiểm hóa (hải quan kiểm tra hàng)"],
      ["熏蒸证书", "xūnzhēng zhèngshū", "Giấy chứng nhận hun trùng"],
      ["反倾销税", "fǎnqīngxiāoshuì", "Thuế chống bán phá giá"],
      ["电放", "diànfàng", "Điện giao hàng (telex release)", "货款收到后我们安排电放。|Huòkuǎn shōu dào hòu wǒmen ānpái diànfàng.|Nhận đủ tiền hàng chúng tôi sẽ làm telex release."]
    ],
    "khieu-nai": [
      ["投诉", "tóusù", "Khiếu nại"],
      ["索赔", "suǒpéi", "Đòi bồi thường (claim)", "我们要对这批货提出索赔。|Wǒmen yào duì zhè pī huò tíchū suǒpéi.|Chúng tôi muốn khiếu nại đòi bồi thường lô hàng này."],
      ["质量问题", "zhìliàng wèntí", "Vấn đề chất lượng"],
      ["短重", "duǎnzhòng", "Thiếu trọng lượng (thiếu cân)", "每桶短重两公斤左右。|Měi tǒng duǎnzhòng liǎng gōngjīn zuǒyòu.|Mỗi phuy thiếu khoảng 2 kg."],
      ["破损", "pòsǔn", "Hư hỏng / vỡ rách"],
      ["结块", "jiékuài", "Vón cục", "到货后发现粉末结块了。|Dàohuò hòu fāxiàn fěnmò jiékuài le.|Hàng về thì phát hiện bột bị vón cục."],
      ["变色", "biànsè", "Đổi màu"],
      ["第三方检验", "dì-sān fāng jiǎnyàn", "Giám định bên thứ ba"],
      ["退货", "tuìhuò", "Trả hàng"],
      ["换货", "huànhuò", "Đổi hàng"],
      ["赔偿", "péicháng", "Bồi thường"],
      ["售后服务", "shòuhòu fúwù", "Dịch vụ sau bán hàng"],
      ["解决方案", "jiějué fāng'àn", "Phương án giải quyết", "请尽快给我们一个解决方案。|Qǐng jǐnkuài gěi wǒmen yí ge jiějué fāng'àn.|Vui lòng sớm đưa chúng tôi phương án giải quyết."]
    ],
    "giao-tiep": [
      ["您好", "nín hǎo", "Xin chào (lịch sự)"],
      ["请问", "qǐngwèn", "Xin hỏi"],
      ["贵公司", "guì gōngsī", "Quý công ty", "贵公司在哪个城市？|Guì gōngsī zài nǎ ge chéngshì?|Quý công ty ở thành phố nào?"],
      ["我们公司", "wǒmen gōngsī", "Công ty chúng tôi"],
      ["名片", "míngpiàn", "Danh thiếp"],
      ["微信", "wēixìn", "WeChat", "加个微信方便联系。|Jiā ge wēixìn fāngbiàn liánxì.|Kết bạn WeChat cho tiện liên lạc."],
      ["合作", "hézuò", "Hợp tác"],
      ["长期合作", "chángqī hézuò", "Hợp tác lâu dài", "希望我们能长期合作。|Xīwàng wǒmen néng chángqī hézuò.|Mong chúng ta hợp tác lâu dài."],
      ["麻烦您", "máfan nín", "Phiền anh/chị (nhờ việc)"],
      ["尽快", "jǐnkuài", "Càng sớm càng tốt"],
      ["回复", "huífù", "Trả lời / phản hồi", "请尽快回复。|Qǐng jǐnkuài huífù.|Vui lòng phản hồi sớm."],
      ["方便", "fāngbiàn", "Tiện / thuận tiện"],
      ["考察工厂", "kǎochá gōngchǎng", "Khảo sát (thăm) nhà máy"],
      ["展会", "zhǎnhuì", "Hội chợ triển lãm"]
    ]
  };

  var WORDS = [];
  TOPICS.forEach(function (t) {
    (RAW[t.id] || []).forEach(function (r, i) {
      var w = { id: t.id + "-" + (i + 1), t: t.id, h: r[0], p: r[1], v: r[2] };
      if (r[3]) {
        var ex = r[3].split("|");
        w.ex = { h: ex[0], p: ex[1], v: ex[2] };
      }
      WORDS.push(w);
    });
  });

  var api = { TOPICS: TOPICS, WORDS: WORDS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HC_VOCAB = api;
})(this);
