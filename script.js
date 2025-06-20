/**
 * 期末复习考试系统 - 主脚本
 * 实现考试流程、计时、答题、成绩统计等主要功能
 */

// DOM 元素引用
const startPage = document.getElementById('start-page');
const questionTypeSelection = document.getElementById('question-type-selection'); // 新增题型选择页面
const examPage = document.getElementById('exam-page');
const resultPage = document.getElementById('result-page');
const selectedSubjectElement = document.getElementById('selected-subject');
const questionContainer = document.getElementById('question-container');
const timerElement = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const answeredCountElement = document.getElementById('answered-count');
const totalQuestionsElement = document.getElementById('total-questions');
const finalScoreElement = document.getElementById('final-score');
const totalScoreElement = document.getElementById('total-score');
const accuracyElement = document.getElementById('accuracy');
const resultMessageElement = document.getElementById('result-message');
const questionReviewContainer = document.getElementById('question-review-container');
const restartExamBtn = document.getElementById('restart-exam');
const backToHomeBtn = document.getElementById('back-to-home');
const backToSubjectsBtn = document.getElementById('back-to-subjects');
const startExamBtn = document.getElementById('start-exam-btn');

// 检查DOM元素是否正确获取
console.log("DOM元素检查:");
console.log("startExamBtn:", startExamBtn);
console.log("backToSubjectsBtn:", backToSubjectsBtn);
console.log("questionTypeSelection:", questionTypeSelection);

// 全局变量
let currentExam = null; // 当前考试的科目
let currentQuestions = []; // 当前考试的题目
let userAnswers = {}; // 用户答案 {questionId: answer}
let timerInterval = null; // 计时器
let timeElapsed = 0; // 已用时间（秒）
let selectedQuestionTypes = []; // 用户选择的题型

/**
 * 显示题型选择页面
 * @param {string} subject - 科目代码
 */
function showQuestionTypeSelection(subject) {
    console.log("进入showQuestionTypeSelection函数");
    console.log("选择的科目:", subject);
    
    // 保存当前选择的科目
    currentExam = subject;
    console.log("设置currentExam为:", currentExam);
    
    // 检查examData
    console.log("examData:", examData);
    console.log("当前科目数据:", examData[subject]);
    
    // 设置标题
    if (selectedSubjectElement) {
        selectedSubjectElement.textContent = examData[subject].title;
        console.log("设置标题为:", examData[subject].title);
    } else {
        console.error("找不到selectedSubjectElement元素");
    }
    
    // 默认选中所有题型
    const checkboxes = document.querySelectorAll('.question-type-checkbox');
    console.log("找到复选框:", checkboxes.length);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        console.log("选中复选框:", checkbox.value);
        
        // 设置默认数量为5题
        const countInput = document.getElementById(`count-${checkbox.value}`);
        if (countInput) {
            countInput.value = 5;
        }
    });

    // 统计每种题型的可用题目数
    updateAvailableQuestionCounts();
    
    // 检查页面元素
    console.log("startPage:", startPage);
    console.log("questionTypeSelection:", questionTypeSelection);
    
    // 隐藏首页，显示题型选择页面
    if (startPage && questionTypeSelection) {
        startPage.classList.add('hidden');
        questionTypeSelection.classList.remove('hidden');
        console.log("切换页面完成");
    } else {
        console.error("页面元素不存在，无法切换页面");
    }
}

/**
 * 更新每种题型的可用题目数量
 */
function updateAvailableQuestionCounts() {
    const questionsData = examData[currentExam].questions;
    const typeCounts = {
        'single': 0,
        'multiple': 0,
        'boolean': 0,
        'fill': 0
    };
    
    // 统计每种题型的数量
    questionsData.forEach(question => {
        if (typeCounts[question.type] !== undefined) {
            typeCounts[question.type]++;
        }
    });
    
    // 更新UI显示
    for (const type in typeCounts) {
        const availableElement = document.getElementById(`available-${type}`);
        const countInput = document.getElementById(`count-${type}`);
        
        if (availableElement && countInput) {
            availableElement.textContent = `/ 可用：${typeCounts[type]}题`;
            
            // 设置输入框最大值
            countInput.max = typeCounts[type];
            
            // 设置默认值为5，但不超过可用题目数
            const defaultCount = Math.min(5, typeCounts[type]);
            
            // 如果当前值大于最大可用数或未设置，调整为合适的值
            if (parseInt(countInput.value) > typeCounts[type] || !countInput.value) {
                countInput.value = typeCounts[type] > 0 ? defaultCount : 0;
            }
            
            // 如果没有可用题目，禁用此题型
            if (typeCounts[type] === 0) {
                document.getElementById(`type-${type}`).disabled = true;
                document.getElementById(`type-${type}`).checked = false;
                countInput.disabled = true;
                countInput.value = 0;
            }
        }
    }
}

/**
 * 开始考试
 */
function startExam() {
    console.log("进入startExam函数");
    console.log("当前科目:", currentExam);
    console.log("examData:", examData);
    
    // 检查科目是否存在
    if (!examData[currentExam]) {
        console.error("科目不存在:", currentExam);
        alert('科目不存在！');
        return;
    }
    
    // 获取用户选择的题型和数量
    selectedQuestionTypes = [];
    const typeSelections = {};
    let totalSelectedQuestions = 0;
    
    console.log("查找已选中的题型复选框");
    const checkedBoxes = document.querySelectorAll('.question-type-checkbox:checked');
    console.log("找到选中的复选框:", checkedBoxes.length);
    
    checkedBoxes.forEach(checkbox => {
        const type = checkbox.value;
        selectedQuestionTypes.push(type);
        console.log("选中题型:", type);
        
        // 获取用户设定的题目数量
        const countInput = document.getElementById(`count-${type}`);
        console.log("数量输入框:", countInput);
        const count = parseInt(countInput.value);
        console.log("题目数量:", count);
        
        if (isNaN(count) || count < 1) {
            typeSelections[type] = 1; // 默认最少1题
        } else {
            typeSelections[type] = count;
        }
        
        totalSelectedQuestions += typeSelections[type];
    });
    
    console.log("选择的题型:", selectedQuestionTypes);
    console.log("题型数量:", typeSelections);
    console.log("总题目数:", totalSelectedQuestions);
    
    // 检查是否至少选择了一种题型
    if (selectedQuestionTypes.length === 0) {
        console.error("未选择任何题型");
        alert('请至少选择一种题型！');
        return;
    }
    
    // 检查是否至少选择了一道题目
    if (totalSelectedQuestions === 0) {
        console.error("未选择任何题目");
        alert('请至少选择一道题目！');
        return;
    }
    
    // 按题型筛选和随机选取题目
    currentQuestions = [];
    
    for (const type of selectedQuestionTypes) {
        // 筛选当前类型的所有题目
        const typeQuestions = examData[currentExam].questions.filter(q => q.type === type);
        console.log(`${type}类型题目:`, typeQuestions.length);
        
        // 随机选择指定数量的题目
        const selectedCount = typeSelections[type];
        const shuffledQuestions = shuffle([...typeQuestions]);
        
        // 确保不超过可用题目数量
        const questionsToAdd = shuffledQuestions.slice(0, selectedCount);
        console.log(`添加${type}题目:`, questionsToAdd.length);
        currentQuestions = currentQuestions.concat(questionsToAdd);
    }
    
    // 再次打乱所有选中的题目顺序
    currentQuestions = shuffle(currentQuestions);
    userAnswers = {};
    
    console.log("最终选择的题目:", currentQuestions.length);
    
    // 设置总题目数
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // 初始化计时器
    timeElapsed = 0;
    startTimer();
    
    // 渲染所有题目
    renderAllQuestions();
    
    console.log("切换页面");
    // 切换页面
    questionTypeSelection.classList.add('hidden');
    examPage.classList.remove('hidden');
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log("考试开始");
}

/**
 * 打乱题目顺序
 * @param {Array} array - 待打乱的数组
 * @returns {Array} 打乱后的新数组
 */
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * 获取题型名称
 * @param {string} type - 题型代码
 * @returns {string} 题型名称
 */
function getQuestionTypeName(type) {
    const typeNames = {
        'single': '单选题',
        'multiple': '多选题',
        'boolean': '判断题',
        'fill': '填空题'
    };
    return typeNames[type] || '未知题型';
}

/**
 * 一次性渲染所有题目
 */
function renderAllQuestions() {
    let questionsHTML = '';
    
    currentQuestions.forEach((question, index) => {
        questionsHTML += renderQuestionItem(question, index);
    });
    
    questionContainer.innerHTML = questionsHTML;
    
    // 添加所有题目的交互事件
    currentQuestions.forEach((question, index) => {
        addQuestionInteractions(question, index);
    });
}

/**
 * 渲染单个题目
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 * @returns {string} HTML字符串
 */
function renderQuestionItem(question, index) {
    let questionHTML = `
        <div id="question-${index}" class="question-item pb-6 border-b border-gray-200 last:border-0">
            <div class="question-header mb-4 flex justify-between items-start">
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    第 ${index + 1} 题 · ${getQuestionTypeName(question.type)}
                </span>
                <a href="#question-${index}" class="text-blue-500 hover:text-blue-700 text-sm">
                    #${index + 1}
                </a>
            </div>
            <div class="question-content mb-6">
                <h3 class="text-xl font-medium mb-4">${question.question}</h3>
    `;
    
    // 根据题型渲染不同的答题区域
    switch (question.type) {
        case 'single':
            questionHTML += renderSingleChoiceOptions(question, index);
            break;
        case 'multiple':
            questionHTML += renderMultipleChoiceOptions(question, index);
            break;
        case 'boolean':
            questionHTML += renderBooleanOptions(question, index);
            break;
        case 'fill':
            questionHTML += renderFillBlankInput(question, index);
            break;
    }
    
    questionHTML += '</div></div>';
    return questionHTML;
}

/**
 * 渲染单选题选项
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 * @returns {string} HTML字符串
 */
function renderSingleChoiceOptions(question, index) {
    // 特殊处理ID为15的题目（可信度因子题目）
    const isSpecialQuestion = question.id === 15;
    
    // 为特殊题目使用完全不同的HTML结构
    if (isSpecialQuestion) {
        let optionsHTML = '<div class="options-container-special" data-question-index="' + index + '">';
        
        question.options.forEach((option, optIndex) => {
            optionsHTML += `
                <div class="option-item-special mb-4 p-3 rounded-lg" data-index="${optIndex}">
                    <div class="flex items-center">
                        <div class="option-marker w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                            <span class="option-index">${String.fromCharCode(65 + optIndex)}</span>
                        </div>
                        <div class="option-text">${escapeHTML(option)}</div>
                    </div>
                </div>
            `;
        });
        
        return optionsHTML + '</div>';
    } else {
        // 原始的渲染逻辑
        let optionsHTML = '<div class="options-container" data-question-index="' + index + '">';
        
        question.options.forEach((option, optIndex) => {
            optionsHTML += `
                <div class="option-item p-3 rounded-lg flex items-start" data-index="${optIndex}">
                    <div class="option-marker w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                        <span class="option-index">${String.fromCharCode(65 + optIndex)}</span>
                    </div>
                    <div class="option-text">${escapeHTML(option)}</div>
                </div>
            `;
        });
        
        return optionsHTML + '</div>';
    }
}

/**
 * 渲染多选题选项
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 * @returns {string} HTML字符串
 */
function renderMultipleChoiceOptions(question, index) {
    let optionsHTML = `
        <div class="mb-3 text-sm text-gray-600">
            <i class="fas fa-info-circle mr-1"></i> 本题为多选题，请选择所有正确选项
        </div>
        <div class="options-container" data-question-index="${index}">
    `;
    
    question.options.forEach((option, optIndex) => {
        optionsHTML += `
            <div class="option-item p-3 rounded-lg flex items-start" data-index="${optIndex}">
                <div class="option-marker w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-check text-white text-sm hidden"></i>
                </div>
                <div class="option-text">${escapeHTML(option)}</div>
            </div>
        `;
    });
    
    return optionsHTML + '</div>';
}

/**
 * 渲染判断题选项
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 * @returns {string} HTML字符串
 */
function renderBooleanOptions(question, index) {
    return `
        <div class="options-container" data-question-index="${index}">
            <div class="option-item p-3 rounded-lg flex items-start" data-value="true">
                <div class="option-marker w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="option-index">√</span>
                </div>
                <div class="option-text">正确</div>
            </div>
            <div class="option-item p-3 rounded-lg flex items-start" data-value="false">
                <div class="option-marker w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="option-index">×</span>
                </div>
                <div class="option-text">错误</div>
            </div>
        </div>
    `;
}

/**
 * 渲染填空题输入框
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 * @returns {string} HTML字符串
 */
function renderFillBlankInput(question, index) {
    return `
        <div class="fill-blank-container mt-6" data-question-index="${index}">
            <input type="text" class="fill-blank-input w-full md:w-1/2 bg-transparent px-2 py-2 text-lg" placeholder="请输入答案...">
        </div>
    `;
}

/**
 * 为题目添加交互事件
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 */
function addQuestionInteractions(question, index) {
    const questionId = question.id;
    
    switch (question.type) {
        case 'single':
            // 判断是否是特殊题目（可信度因子题）
            const isSpecialQuestion = question.id === 15;
            const selector = isSpecialQuestion 
                ? `.options-container-special[data-question-index="${index}"]` 
                : `.options-container[data-question-index="${index}"]`;
            const itemClass = isSpecialQuestion ? '.option-item-special' : '.option-item';
            
            // 单选题选项点击事件
            const singleOptions = document.querySelector(selector).querySelectorAll(itemClass);
            singleOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // 移除其他选中状态
                    singleOptions.forEach(opt => opt.classList.remove('option-selected'));
                    this.classList.add('option-selected');
                    
                    // 记录答案
                    userAnswers[questionId] = parseInt(this.dataset.index);
                    
                    // 更新答题进度
                    updateAnsweredCount();
                });
            });
            break;
            
        case 'multiple':
            // 多选题选项点击事件
            const multipleOptions = document.querySelector(`.options-container[data-question-index="${index}"]`).querySelectorAll('.option-item');
            multipleOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // 切换选中状态
                    this.classList.toggle('option-selected');
                    
                    // 更新用户答案
                    const selectedOptions = Array.from(multipleOptions)
                        .filter(opt => opt.classList.contains('option-selected'))
                        .map(opt => parseInt(opt.dataset.index));
                    
                    if (selectedOptions.length > 0) {
                        userAnswers[questionId] = selectedOptions;
                    } else {
                        delete userAnswers[questionId];
                    }
                    
                    // 更新答题进度
                    updateAnsweredCount();
                });
            });
            break;
            
        case 'boolean':
            // 判断题选项点击事件
            const booleanOptions = document.querySelector(`.options-container[data-question-index="${index}"]`).querySelectorAll('.option-item');
            booleanOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // 移除其他选中状态
                    booleanOptions.forEach(opt => opt.classList.remove('option-selected'));
                    this.classList.add('option-selected');
                    
                    // 记录答案
                    userAnswers[questionId] = this.dataset.value === 'true';
                    
                    // 更新答题进度
                    updateAnsweredCount();
                });
            });
            break;
            
        case 'fill':
            // 填空题输入事件
            const input = document.querySelector(`.fill-blank-container[data-question-index="${index}"]`).querySelector('input');
            input.addEventListener('input', function() {
                const value = this.value.trim();
                
                if (value) {
                    userAnswers[questionId] = value;
                } else {
                    delete userAnswers[questionId];
                }
                
                // 更新答题进度
                updateAnsweredCount();
            });
            break;
    }
    
    // 预填用户之前的答案
    prefillUserAnswer(question, index);
}

/**
 * 预填用户之前的答案
 * @param {Object} question - 题目数据
 * @param {number} index - 题目索引
 */
function prefillUserAnswer(question, index) {
    const answer = userAnswers[question.id];
    if (answer === undefined) return;
    
    switch (question.type) {
        case 'single':
            // 判断是否是特殊题目（可信度因子题）
            const isSpecialQuestion = question.id === 15;
            const selector = isSpecialQuestion 
                ? `.options-container-special[data-question-index="${index}"]` 
                : `.options-container[data-question-index="${index}"]`;
            const itemClass = isSpecialQuestion ? '.option-item-special' : '.option-item';
            
            const singleOptions = document.querySelector(selector).querySelectorAll(itemClass);
            singleOptions[answer]?.classList.add('option-selected');
            break;
            
        case 'multiple':
            const multipleOptions = document.querySelector(`.options-container[data-question-index="${index}"]`).querySelectorAll('.option-item');
            answer.forEach(optIndex => {
                multipleOptions[optIndex]?.classList.add('option-selected');
            });
            break;
            
        case 'boolean':
            const booleanOptions = document.querySelector(`.options-container[data-question-index="${index}"]`).querySelectorAll('.option-item');
            booleanOptions[answer ? 0 : 1]?.classList.add('option-selected');
            break;
            
        case 'fill':
            const input = document.querySelector(`.fill-blank-container[data-question-index="${index}"]`).querySelector('input');
            input.value = answer;
            break;
    }
}

/**
 * 更新已答题目数量
 */
function updateAnsweredCount() {
    const answeredCount = Object.keys(userAnswers).length;
    answeredCountElement.textContent = answeredCount;
    
    // 更新进度条
    const progressPercentage = (answeredCount / currentQuestions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

/**
 * 开始计时器
 */
function startTimer() {
    // 清除可能存在的旧计时器
    if (timerInterval) clearInterval(timerInterval);
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000);
}

/**
 * 更新计时器显示
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 计算考试结果
 * @returns {Object} 考试结果对象
 */
function calculateResult() {
    let correctCount = 0;
    let answeredCount = 0;
    const questionResults = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        let isCorrect = false;
        
        // 检查是否已回答
        const isAnswered = userAnswer !== undefined;
        if (isAnswered) {
            answeredCount++;
            
            // 检查答案是否正确
            switch (question.type) {
                case 'single':
                    isCorrect = userAnswer === question.answer;
                    break;
                    
                case 'multiple':
                    // 多选题需要选项完全匹配
                    isCorrect = 
                        userAnswer.length === question.answer.length && 
                        userAnswer.every(a => question.answer.includes(a));
                    break;
                    
                case 'boolean':
                    isCorrect = userAnswer === question.answer;
                    break;
                    
                case 'fill':
                    // 填空题检查答案是否在可接受答案列表中
                    isCorrect = userAnswer && question.answer.some(ans => 
                        typeof userAnswer === 'string' && userAnswer.toLowerCase() === ans.toLowerCase()
                    );
                    break;
            }
            
            if (isCorrect) correctCount++;
        }
        
        // 添加到结果数组
        questionResults.push({
            question,
            userAnswer,
            isCorrect,
            isAnswered
        });
    });
    
    // 计算分数和正确率
    const totalQuestions = currentQuestions.length;
    // 分数仍然基于总题目数计算
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    // 正确率基于已回答的题目数计算
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    
    return {
        score,
        accuracy,
        correctCount,
        totalQuestions,
        answeredCount,
        questionResults
    };
}

/**
 * 错题重做功能
 * @param {Array} wrongIndices - 错题的索引数组
 */
function startWrongQuestionsExam(wrongIndices) {
    if (wrongIndices.length === 0) {
        alert('没有错题可以重做！');
        return;
    }
    
    // 创建一个只包含错题的数组
    const wrongQuestions = wrongIndices.map(index => currentQuestions[index]);
    
    // 重置答题状态
    const oldExam = currentExam;
    currentQuestions = [...wrongQuestions];
    userAnswers = {};
    timeElapsed = 0;
    
    // 设置标题，表明这是错题练习
    selectedSubjectElement.textContent = examData[oldExam].title + " - 错题练习";
    
    // 设置总题目数
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // 初始化计时器
    startTimer();
    
    // 渲染所有题目
    renderAllQuestions();
    
    // 切换页面
    resultPage.classList.add('hidden');
    examPage.classList.remove('hidden');
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 返回首页
 */
function backToHome() {
    // 隐藏所有页面，显示首页
    resultPage.classList.add('hidden');
    examPage.classList.add('hidden');
    questionTypeSelection.classList.add('hidden');
    startPage.classList.remove('hidden');
    
    // 清除计时器
    clearInterval(timerInterval);
    
    // 重置数据
    currentQuestions = [];
    userAnswers = {};
    timeElapsed = 0;
}

/**
 * 返回科目选择页面
 */
function backToSubjects() {
    questionTypeSelection.classList.add('hidden');
    startPage.classList.remove('hidden');
}

/**
 * 提交考试
 */
function submitExam() {
    // 清除计时器
    clearInterval(timerInterval);
    
    // 计算成绩
    const result = calculateResult();
    
    // 显示用时
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const timeUsed = `${minutes}分${seconds}秒`;
    
    // 添加用时到结果中
    result.timeUsed = timeUsed;
    
    // 显示成绩
    displayResult(result);
    
    // 切换到结果页面
    examPage.classList.add('hidden');
    resultPage.classList.remove('hidden');
    
    // 平滑滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 收集错题索引
    const wrongQuestions = [];
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        let isCorrect = false;
        
        // 检查答案是否正确
        if (userAnswer !== undefined) {
            switch (question.type) {
                case 'single':
                    isCorrect = userAnswer === question.answer;
                    break;
                    
                case 'multiple':
                    // 多选题需要选项完全匹配
                    isCorrect = 
                        userAnswer.length === question.answer.length && 
                        userAnswer.every(a => question.answer.includes(a));
                    break;
                    
                case 'boolean':
                    isCorrect = userAnswer === question.answer;
                    break;
                    
                case 'fill':
                    // 填空题检查答案是否在可接受答案列表中
                    isCorrect = userAnswer && question.answer.some(ans => 
                        typeof userAnswer === 'string' && userAnswer.toLowerCase() === ans.toLowerCase()
                    );
                    break;
            }
        }
        
        if (!isCorrect) wrongQuestions.push(index);
    });
    
    // 直接渲染全部题目，筛选功能已在DOMContentLoaded事件中处理
    document.querySelector('.review-filter-btn[data-filter="all"]').classList.add('active');
    document.querySelector('.review-filter-btn[data-filter="wrong"]').classList.remove('active');
    renderQuestionReview(result.questionResults);
}

/**
 * 显示考试结果
 * @param {Object} result - 考试结果
 */
function displayResult(result) {
    // 设置分数 - 修改为显示正确题目数/已答题目数
    finalScoreElement.textContent = result.correctCount;
    totalScoreElement.textContent = result.answeredCount;
    accuracyElement.textContent = `${result.accuracy}%`;
    
    // 添加正确/错误题目数量，基于已答题目
    document.getElementById('correct-count').textContent = result.correctCount;
    document.getElementById('incorrect-count').textContent = result.answeredCount - result.correctCount;
    
    // 根据分数设置消息
    let message = '';
    if (result.score >= 90) {
        message = '优秀！你对这个科目掌握得非常好！';
    } else if (result.score >= 75) {
        message = '良好！你已经掌握了大部分知识点！';
    } else if (result.score >= 60) {
        message = '及格！还有一些知识点需要巩固哦。';
    } else {
        message = '需要继续努力！建议重新复习这个科目。';
    }
    
    // 添加用时信息和答题情况
    message += ` 用时：${result.timeUsed}`;
    if (result.answeredCount < result.totalQuestions) {
        message += `，共完成 ${result.answeredCount}/${result.totalQuestions} 题`;
    }
    resultMessageElement.textContent = message;
    
    // 渲染题目回顾
    renderQuestionReview(result.questionResults);
}

/**
 * 渲染题目回顾
 * @param {Array} questionResults - 题目结果数组
 */
function renderQuestionReview(questionResults) {
    const container = document.getElementById('question-review-container');
    container.innerHTML = '';
    
    if (!questionResults || questionResults.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-4">没有符合条件的题目</div>';
        return;
    }
    
    // 如果是旧格式的题目数组，转换为新格式
    let results = questionResults;
    if (!questionResults[0].hasOwnProperty('isCorrect')) {
        results = questionResults.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            let isCorrect = false;
            
            // 检查答案是否正确
            if (userAnswer !== undefined) {
                switch (question.type) {
                    case 'single':
                        isCorrect = userAnswer === question.answer;
                        break;
                        
                    case 'multiple':
                        // 多选题需要选项完全匹配
                        isCorrect = 
                            userAnswer.length === question.answer.length && 
                            userAnswer.every(a => question.answer.includes(a));
                        break;
                        
                    case 'boolean':
                        isCorrect = userAnswer === question.answer;
                        break;
                        
                    case 'fill':
                        // 填空题检查答案是否在可接受答案列表中
                        isCorrect = userAnswer && question.answer.some(ans => 
                            typeof userAnswer === 'string' && userAnswer.toLowerCase() === ans.toLowerCase()
                        );
                        break;
                }
            }
            
            return { question, userAnswer, isCorrect };
        });
    }
    
    // 根据题型分组显示
    const typeNames = {
        'single': '单选题',
        'multiple': '多选题',
        'boolean': '判断题',
        'fill': '填空题'
    };
    
    // 按题型分组
    const groupedByType = {};
    results.forEach(result => {
        const type = result.question.type;
        if (!groupedByType[type]) {
            groupedByType[type] = [];
        }
        groupedByType[type].push(result);
    });
    
    // 按题型顺序渲染
    for (const type of ['single', 'multiple', 'boolean', 'fill']) {
        if (!groupedByType[type] || groupedByType[type].length === 0) continue;
        
        const typeResults = groupedByType[type];
        const typeName = typeNames[type];
        
        const typeSection = document.createElement('div');
        typeSection.className = 'question-type-section mb-6';
        typeSection.innerHTML = `<h4 class="font-medium text-gray-700 mb-3">${typeName}</h4>`;
        
        typeResults.forEach((result, idx) => {
            const { question, userAnswer, isCorrect } = result;
            
            const questionDiv = document.createElement('div');
            questionDiv.className = `question-review mb-4 p-4 rounded ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`;
            
            let questionTitle = `${idx + 1}. ${question.question}`;
            let optionsHTML = '';
            
            switch (question.type) {
                case 'single':
                    optionsHTML = renderSingleChoiceReview(question, userAnswer);
                    break;
                case 'multiple':
                    optionsHTML = renderMultipleChoiceReview(question, userAnswer);
                    break;
                case 'boolean':
                    optionsHTML = renderBooleanReview(question, userAnswer);
                    break;
                case 'fill':
                    optionsHTML = renderFillBlankReview(question, userAnswer);
                    break;
            }
            
            questionDiv.innerHTML = `
                <div class="font-medium mb-2 flex justify-between">
                    <div>${questionTitle}</div>
                    <div class="${isCorrect ? 'text-green-500' : 'text-red-500'}">
                        ${isCorrect ? '<i class="fas fa-check-circle"></i> 正确' : '<i class="fas fa-times-circle"></i> 错误'}
                    </div>
                </div>
                ${optionsHTML}
                ${question.explanation ? `<div class="explanation mt-3 text-gray-600 bg-gray-50 p-3 rounded">
                    <div class="font-medium text-gray-700">解析：</div>
                    <div>${question.explanation}</div>
                </div>` : ''}
            `;
            
            typeSection.appendChild(questionDiv);
        });
        
        container.appendChild(typeSection);
    }
    
    // 如果没有题目显示提示信息
    if (container.children.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-4">没有符合条件的题目</div>';
    }
}

/**
 * 渲染单选题回顾
 * @param {Object} question - 题目数据
 * @param {string|number} userAnswer - 用户答案
 * @returns {string} HTML字符串
 */
/**
 * 转义HTML特殊字符
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHTML(text) {
    if (typeof text !== 'string') return text;
    
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderSingleChoiceReview(question, userAnswer) {
    // 特殊处理ID为15的题目（可信度因子题目）
    const isSpecialQuestion = question.id === 15;
    
    if (isSpecialQuestion) {
        let html = '<div class="options mt-2 special-review-options">';
        
        question.options.forEach((option, idx) => {
            const isSelected = userAnswer === idx;
            const isCorrectOption = question.answer === idx;
            
            let optionClass = '';
            if (isSelected && isCorrectOption) {
                optionClass = 'text-green-700 font-medium';
            } else if (isSelected && !isCorrectOption) {
                optionClass = 'text-red-700 font-medium line-through';
            } else if (!isSelected && isCorrectOption) {
                optionClass = 'text-green-700 font-medium';
            }
            
            html += `<div class="option-special ${optionClass} mb-3 p-2 rounded">
                <div class="flex items-center">
                    <span class="mr-2">${String.fromCharCode(65 + idx)}.</span> 
                                            <span>${escapeHTML(option)}</span>
                    ${isCorrectOption ? '<i class="fas fa-check-circle ml-2 text-green-500"></i>' : ''}
                    ${isSelected && !isCorrectOption ? '<i class="fas fa-times-circle ml-2 text-red-500"></i>' : ''}
                </div>
            </div>`;
        });
        
        return html + '</div>';
    } else {
        let html = '<div class="options mt-2">';
        
        question.options.forEach((option, idx) => {
            const isSelected = userAnswer === idx;
            const isCorrectOption = question.answer === idx;
            
            let optionClass = '';
            if (isSelected && isCorrectOption) {
                optionClass = 'text-green-700 font-medium';
            } else if (isSelected && !isCorrectOption) {
                optionClass = 'text-red-700 font-medium line-through';
            } else if (!isSelected && isCorrectOption) {
                optionClass = 'text-green-700 font-medium';
            }
            
            html += `<div class="option ${optionClass}">
                ${String.fromCharCode(65 + idx)}. ${escapeHTML(option)}
                ${isCorrectOption ? '<i class="fas fa-check-circle ml-2 text-green-500"></i>' : ''}
                ${isSelected && !isCorrectOption ? '<i class="fas fa-times-circle ml-2 text-red-500"></i>' : ''}
            </div>`;
        });
        
        return html + '</div>';
    }
}

/**
 * 渲染多选题回顾
 * @param {Object} question - 题目数据
 * @param {Array} userAnswer - 用户答案
 * @returns {string} HTML字符串
 */
function renderMultipleChoiceReview(question, userAnswer) {
    let html = '<div class="options mt-2">';
    
    question.options.forEach((option, idx) => {
        // 修复错误：确保userAnswer是数组类型并且有includes方法
        const isSelected = userAnswer && Array.isArray(userAnswer) && userAnswer.includes(idx);
        const isCorrectOption = question.answer.includes(idx);
        
        let optionClass = '';
        if (isSelected && isCorrectOption) {
            optionClass = 'text-green-700 font-medium';
        } else if (isSelected && !isCorrectOption) {
            optionClass = 'text-red-700 font-medium line-through';
        } else if (!isSelected && isCorrectOption) {
            optionClass = 'text-green-700 font-medium';
        }
        
        html += `<div class="option ${optionClass}">
            ${String.fromCharCode(65 + idx)}. ${option}
            ${isCorrectOption ? '<i class="fas fa-check-circle ml-2 text-green-500"></i>' : ''}
            ${isSelected && !isCorrectOption ? '<i class="fas fa-times-circle ml-2 text-red-500"></i>' : ''}
        </div>`;
    });
    
    return html + '</div>';
}

/**
 * 渲染判断题回顾
 * @param {Object} question - 题目数据
 * @param {boolean} userAnswer - 用户答案
 * @returns {string} HTML字符串
 */
function renderBooleanReview(question, userAnswer) {
    let html = '<div class="options mt-2">';
    
    const options = [{ value: true, label: '正确' }, { value: false, label: '错误' }];
    
    options.forEach(option => {
        const isSelected = userAnswer === option.value;
        const isCorrectOption = question.answer === option.value;
        
        let optionClass = '';
        if (isSelected && isCorrectOption) {
            optionClass = 'text-green-700 font-medium';
        } else if (isSelected && !isCorrectOption) {
            optionClass = 'text-red-700 font-medium line-through';
        } else if (!isSelected && isCorrectOption) {
            optionClass = 'text-green-700 font-medium';
        }
        
        html += `<div class="option ${optionClass}">
            ${option.label}
            ${isCorrectOption ? '<i class="fas fa-check-circle ml-2 text-green-500"></i>' : ''}
            ${isSelected && !isCorrectOption ? '<i class="fas fa-times-circle ml-2 text-red-500"></i>' : ''}
        </div>`;
    });
    
    return html + '</div>';
}

/**
 * 渲染填空题回顾
 * @param {Object} question - 题目数据
 * @param {string} userAnswer - 用户答案
 * @returns {string} HTML字符串
 */
function renderFillBlankReview(question, userAnswer) {
    const isCorrect = userAnswer && question.answer.some(ans => 
        typeof userAnswer === 'string' && userAnswer.toLowerCase() === ans.toLowerCase()
    );
    
    return `<div class="mt-2">
        <div>您的答案：<span class="${isCorrect ? 'text-green-700' : 'text-red-700'}">${userAnswer || '未作答'}</span></div>
        ${!isCorrect ? `<div class="text-green-700">正确答案：${question.answer.join(' 或 ')}</div>` : ''}
    </div>`;
}

// 绑定事件处理程序
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，开始绑定事件");
    
    // 检查关键DOM元素
    const subjectAi = document.getElementById('subject-ai');
    const startExamBtnCheck = document.getElementById('start-exam-btn');
    console.log("科目元素:", subjectAi);
    console.log("开始考试按钮:", startExamBtnCheck);
    
    // 科目选择事件
    if (subjectAi) {
        subjectAi.onclick = function() {
            console.log("点击了科目卡片");
            showQuestionTypeSelection('ai');
        };
    } else {
        console.error("找不到科目元素!");
    }
    
    // 全选按钮事件
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.onclick = function() {
            console.log("点击了全选按钮");
            
            // 获取当前科目的题目数据
            const questionsData = examData[currentExam].questions;
            const typeCounts = {
                'single': 0,
                'multiple': 0,
                'boolean': 0,
                'fill': 0
            };
            
            // 统计每种题型的数量
            questionsData.forEach(question => {
                if (typeCounts[question.type] !== undefined) {
                    typeCounts[question.type]++;
                }
            });
            
            // 选中所有题型复选框并设置最大题目数
            document.querySelectorAll('.question-type-checkbox').forEach(function(checkbox) {
                const type = checkbox.value;
                
                // 如果该题型有可用题目，则选中并设置最大数量
                if (typeCounts[type] > 0) {
                    checkbox.checked = true;
                    checkbox.disabled = false;
                    
                    // 启用对应的数量输入框
                    const countInput = document.getElementById(`count-${type}`);
                    if (countInput) {
                        countInput.disabled = false;
                        
                        // 直接设置为可用的最大题目数
                        countInput.value = typeCounts[type];
                        console.log(`设置${type}题型数量为:`, typeCounts[type]);
                    }
                }
            });
        };
    }
    
    // 题型选择页面的返回按钮
    if (backToSubjectsBtn) {
        backToSubjectsBtn.onclick = function() {
            console.log("点击了返回按钮");
            backToSubjects();
        };
    } else {
        console.error("找不到返回按钮!");
    }
    
    // 题型选择页面的复选框改变事件
    document.querySelectorAll('.question-type-checkbox').forEach(function(checkbox) {
        checkbox.onchange = function() {
            console.log("复选框状态改变:", this.value, this.checked);
            const type = this.value;
            const countInput = document.getElementById(`count-${type}`);
            
            // 如果取消选中，则禁用对应的数量输入框
            if (!this.checked) {
                countInput.disabled = true;
            } else {
                countInput.disabled = false;
            }
        };
    });
    
    // 开始考试按钮
    if (startExamBtnCheck) {
        console.log("找到开始考试按钮，绑定点击事件");
        startExamBtnCheck.onclick = function() {
            console.log("点击了开始考试按钮");
            startExam();
        };
    } else {
        console.error("找不到开始考试按钮!");
    }
    
    // 交卷按钮
    const submitExamBtn = document.getElementById('submit-exam');
    if (submitExamBtn) {
        submitExamBtn.onclick = function() {
            console.log("点击了交卷按钮");
            // 检查是否还有未答题目
            const unansweredCount = currentQuestions.length - Object.keys(userAnswers).length;
            
            if (unansweredCount > 0) {
                if (!confirm(`你还有 ${unansweredCount} 题未作答，确认交卷吗？`)) {
                    return;
                }
            } else if (!confirm('确认交卷吗？')) {
                return;
            }
            
            submitExam();
        };
    } else {
        console.error("找不到交卷按钮!");
    }
    
    // 返回首页按钮
    if (backToHomeBtn) {
        backToHomeBtn.onclick = function() {
            console.log("点击了返回首页按钮");
            backToHome();
        };
    } else {
        console.error("找不到返回首页按钮!");
    }
    
    // 重新考试按钮
    const restartExamBtn = document.getElementById('restart-exam');
    if (restartExamBtn) {
        restartExamBtn.onclick = function() {
            console.log("点击了重新考试按钮");
            backToHome();
            // 延迟一下再选择科目
            setTimeout(function() {
                showQuestionTypeSelection(currentExam);
            }, 100);
        };
    }
    
    // 错题重做按钮
    const wrongQuestionsExamBtn = document.getElementById('wrong-questions-exam');
    if (wrongQuestionsExamBtn) {
        wrongQuestionsExamBtn.onclick = function() {
            console.log("点击了错题重做按钮");
            // 收集错题索引
            const wrongIndices = [];
            currentQuestions.forEach((question, index) => {
                const userAnswer = userAnswers[question.id];
                let isCorrect = false;
                
                // 检查答案是否正确
                if (userAnswer !== undefined) {
                    switch (question.type) {
                        case 'single':
                            isCorrect = userAnswer === question.answer;
                            break;
                            
                        case 'multiple':
                            // 多选题需要选项完全匹配
                            isCorrect = 
                                userAnswer.length === question.answer.length && 
                                userAnswer.every(a => question.answer.includes(a));
                            break;
                            
                        case 'boolean':
                            isCorrect = userAnswer === question.answer;
                            break;
                            
                        case 'fill':
                            // 填空题检查答案是否在可接受答案列表中
                            isCorrect = userAnswer && question.answer.some(ans => 
                                typeof userAnswer === 'string' && userAnswer.toLowerCase() === ans.toLowerCase()
                            );
                            break;
                    }
                }
                
                if (!isCorrect) wrongIndices.push(index);
            });
            
            startWrongQuestionsExam(wrongIndices);
        };
    }
    
    // 筛选按钮
    const filterButtons = document.querySelectorAll('.review-filter-btn');
    filterButtons.forEach(function(btn) {
        btn.onclick = function() {
            filterButtons.forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            const filterType = btn.getAttribute('data-filter');
            if (filterType === 'all') {
                renderQuestionReview(calculateResult().questionResults);
            } else if (filterType === 'wrong') {
                renderQuestionReview(calculateResult().questionResults.filter(item => !item.isCorrect));
            }
        };
    });
    
    console.log("事件绑定完成");
    
    // 将函数暴露到全局作用域
    window.showQuestionTypeSelection = showQuestionTypeSelection;
    window.startExam = startExam;
    window.submitExam = submitExam;
});

/**
 * 空的导航渲染函数，用于兼容 GitHub Pages
 * 这个函数在本地代码中已经不再需要，但为了兼容 GitHub Pages 上的旧代码，保留一个空实现
 */
function renderQuestionNavigation() {
    console.log("renderQuestionNavigation 函数已被废弃，不再需要");
    // 不执行任何操作
}