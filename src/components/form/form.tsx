import React, {useState} from "react";
import './form.scss'

interface SalaryMode {
    id: number,
    inputId: string,
    label: string,
    perTimeLabel?: string
}

const SALARY_MODES: SalaryMode [] = [
    {
        id: 1,
        inputId: 'salary-mode-month',
        label: 'Оклад за месяц'
    },
    {
        id: 2,
        inputId: 'salary-mode-MROT',
        label: 'МРОТ'
    },
    {
        id: 3,
        inputId: 'salary-mode-daily',
        label: 'Оплата за день',
        perTimeLabel: 'в день'
    },
    {
        id: 4,
        inputId: 'salary-mode-hourly',
        label: 'Оплата за час',
        perTimeLabel: 'в час'
    }
];

interface Tooltip {
    isOn: boolean,
    clicked: boolean
}

function Form() {

    const [salaryMode, setSalaryMode] = useState<SalaryMode>(SALARY_MODES[0]);
    const [ndflIncluded, setNDFL] = useState<boolean>(false);
    const [salaryValue, setSalaryValue] = useState<number>(0);
    const [tooltipState, setTooltipState] = useState<Tooltip>({isOn: false, clicked: false});


    const currencyFormatterUnsign = new Intl.NumberFormat("ru-RU", {
        style: "decimal",
        currency: "RUB",
        maximumFractionDigits: 0
    });

    const currencyFormatterSign = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0
    });

    const salaryTextValueRef: any = React.createRef<HTMLInputElement>();

    const toggleTooltipByClick = () => {
        if (!tooltipState.clicked) {
            setTooltipState({isOn: true, clicked: !tooltipState.clicked})
        } else {
            setTooltipState({isOn: false, clicked: !tooltipState.clicked})
        }
    };

    const toggleTooltipByHover = (isOn: boolean) => {
        !tooltipState.clicked && setTooltipState({isOn: isOn, clicked: tooltipState.clicked})
    };


    const salaryModeInputs = SALARY_MODES.map(mode =>
        <div className="salary-mode-option" key={mode.id}>
            <label className="radio-button" htmlFor={mode.inputId}>
                <input type="radio"
                       className="radio-button__input"
                       id={mode.inputId} value={mode.id}
                       defaultChecked={mode.id === 1}
                       name="salary-mode"/>
                <span className="radio-button__control"> </span>
                <span className="radio-button__label">{mode.label}</span>
            </label>
            {mode.id === 2 &&
            <div className={`tooltip ${tooltipState.isOn ? 'tp-opened' : ''}`}
                 onClick={toggleTooltipByClick}
                 onMouseEnter={() => toggleTooltipByHover(true)}
                 onMouseLeave={() => toggleTooltipByHover(false)}>
                <div
                    className={`tooltip-icon ${tooltipState.clicked ? 'tp-clicked' : ''}`}>{tooltipState.clicked ? 'x' : 'i'}</div>
                <span className="tooltiptext">МРОТ - минимальный размер оплаты труда. Разный для разных регионов.</span>
            </div>
            }
        </div>
    );

    const handleSalaryModeChange = (value: string) => {
        const mode = SALARY_MODES.find(x => x.id === parseInt(value, 10));
        mode && setSalaryMode(mode);
    };

    const formatSalaryValue = () => {
        return salaryValue === 0 ? '' : currencyFormatterUnsign.format(salaryValue)
    };

    const changeSalaryValue = (e: any) => {
        const regOnlyNumbs = /^\d+$/;
        const newValue = e.target.value.replace(/\s+/g, '');
        (regOnlyNumbs.test(newValue) || newValue === '') && setSalaryValue(newValue === '' ? 0 : parseInt(newValue, 10));
    };

    const employeeInHandsSum = (): number => {
        return ndflIncluded ? (salaryValue - ndflSum()) : salaryValue;
    };

    const ndflSum = (): number => {
        return (salaryValue / 100) * 13;
    };

    const employeeCostSum = (): number => {
        return ndflIncluded ? salaryValue : (salaryValue + ndflSum());
    };

    return (
        <div className='form-container'>

            <div className="form-title">
                Сумма
            </div>

            <form action="#" className="salary-form">

                <div className="form-field-items">

                    <div className='salary-mode-select form-item'
                         onChange={(e) => handleSalaryModeChange((e.target as HTMLInputElement).value)}>
                        {salaryModeInputs}
                    </div>

                    <div className="ndfl form-item">
                        <div className={`with-ndfl-title ${ndflIncluded ? '' : 'inactive-title'}`}>
                            Указать с НДФЛ
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={!ndflIncluded}
                                   onChange={(e) => setNDFL(!(e.target as HTMLInputElement).checked)}/>
                            <span className="slider round"></span>
                        </label>
                        <div className={`without-ndfl-title ${ndflIncluded ? 'inactive-title' : ''}`}>
                            Без НДФЛ
                        </div>
                    </div>

                    {salaryMode.id !== 2 &&
                    <div className="salary-value form-item">
                        <input
                            pattern="[0-9]*"
                            className="visible salary-value-text"
                            type="text"
                            ref={salaryTextValueRef}
                            name="salary-value visible"
                            id="salary-value"
                            value={formatSalaryValue()}
                            onChange={changeSalaryValue}
                            maxLength={14}
                        />
                        <label
                            htmlFor="salary-value">&#8381;{` ${salaryMode.perTimeLabel ? salaryMode.perTimeLabel : ''}`}</label>
                    </div>
                    }
                </div>
            </form>

            {(salaryMode.id === 1 && salaryValue > 0) &&
            <div className="form-info">

                <div className="employee-in-hands-sum">
                    {currencyFormatterSign.format(employeeInHandsSum())} сотрудник будет получать на руки
                </div>
                <div className="ndfl-sum">
                    {currencyFormatterSign.format(ndflSum())} НДФЛ, 13% от оклада
                </div>
                <div className="employee-cost-sum">
                    {currencyFormatterSign.format(employeeCostSum())} за сотрудника в месяц
                </div>
            </div>
            }
        </div>
    );
}

export default Form;
