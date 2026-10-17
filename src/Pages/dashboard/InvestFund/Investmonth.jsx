import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck,
  ArrowRight,
  Bot,
  TrendingUp,
  CalendarDays,
  Coins,
} from 'lucide-react';

import apiClient from '../../../api/apiClient';
import { useUser } from '../../../context/UserContext';
import Toast from '../../../Componenets/ui/Toast';
import "../InvestFund/Invest.css"
import StakeCrad from '../StakeCrad';
import { Link } from 'react-router-dom';

const Investmonth = () => {
  const { fetchData } = useUser();

  const [bot3Amount, setBot3Amount] = useState('');
  const [loadingBot3, setLoadingBot3] = useState(false);

  const regno = sessionStorage.getItem('Regno');

  const investInBot3 = async (amount) => {
    const value = Number(amount);

    if (!amount || !Number.isFinite(value) || value <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (value < 1000) {
      toast.error('Bot 3: Minimum investment is $1000.');
      return;
    }

    setLoadingBot3(true);

    try {
      const response = await apiClient.post('/Dashboard/Investment', {
        regno: regno,
        rkprice: value,
        uRegno: 0,
        type: 'Stake',
      });

      if (response.data.result === 'true') {
        toast.success(response.data.message);
        await fetchData();
        setBot3Amount('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoadingBot3(false);
    }
  };

  const styles = {
    card: {
      width: '100%',
      padding: '22px',
      borderRadius: '20px',
      background: '#ffffff',
      border: '1px solid #e7edf7',
      boxShadow: '0 5px 22px rgba(24, 62, 120, 0.045)',
      color: '#172b4d',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box',
    },

    headerIcon: {
      width: 52,
      height: 52,
      minWidth: 52,
      borderRadius: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #35b5ff, #1758f5)',
      color: '#ffffff',
      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.17)',
    },

    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 11px',
      borderRadius: 30,
      background: '#e8faf1',
      color: '#0da565',
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    panel: {
      position: 'relative',
      minHeight: 245,
      height: '100%',
      padding: '21px',
      borderRadius: 17,
      border: '1px solid #dfebfc',
      background:
        'linear-gradient(125deg, #f5f9ff 0%, #ffffff 58%, #edf5ff 100%)',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },

    profitLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '7px 10px',
      borderRadius: 8,
      background: '#e8f2ff',
      color: '#176ff0',
      fontSize: 12,
      fontWeight: 650,
    },

    amountInput: {
      width: '100%',
      height: 49,
      border: '1px solid #dce5f2',
      borderRadius: 11,
      outline: 'none',
      background: '#ffffff',
      color: '#172b4d',
      fontSize: 14,
      padding: '10px 14px 10px 42px',
      boxSizing: 'border-box',
      transition: 'border-color .2s, box-shadow .2s',
    },

    button: {
      width: '100%',
      height: 49,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      border: 'none',
      borderRadius: 12,
      background: 'linear-gradient(100deg, #29a7ff, #2160f5)',
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 750,
      letterSpacing: '.25px',
      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.16)',
      cursor: loadingBot3 ? 'wait' : 'pointer',
      opacity: loadingBot3 ? 0.75 : 1,
      transition: 'transform .2s, box-shadow .2s',
    },
  };

  return (
    <div className="investMonthPage py-3 py-md-4">
      <Toast />

      <div className="container-fluid px-2 px-md-3">
        <div className="investMonthCard" style={styles.card}>

          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div style={styles.headerIcon}>
                <Bot size={29} strokeWidth={2} />
              </div>

              <div>
                <h3 className="investMonthTitle mb-1">BOT 3</h3>
                <p className="investMonthSubtitle mb-0">
                  Smart Investment Bot
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <div className="investMonthTrust">
                <Link to="/dashboard/Bot3PayoutReport">
                <button className='btn btn-primary' >Report</button>
                </Link>
              </div>

              
            </div>
          </div>

          {/* Investment details */}
          <div className="row g-3 align-items-stretch mb-4">

            {/* Robot image */}
            <div className="col-12 col-md-4 col-xl-3">
              <div className="investMonthRobot">
                <img
                  src="https://i.pinimg.com/736x/2f/a9/af/2fa9afe7803e88bf73727ba5d83d25a9.jpg"
                  alt="BOT 3 investment robot"
                  className="investMonthRobotImg"
                />
              </div>
            </div>

            {/* Profit panel */}
            <div className="col-12 col-md-8 col-xl-9">
              <div style={styles.panel}>

                <div className="investMonthGrowthArt" aria-hidden="true">
                  <div className="investMonthBars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <TrendingUp size={90} strokeWidth={1.7} />

                  <div className="investMonthCoins">
                    <Coins size={31} />
                    <Coins size={43} />
                    <Coins size={30} />
                  </div>
                </div>

                <div className="investMonthPanelContent">
                  <div style={styles.profitLabel} className="mb-3">
                    <CalendarDays size={15} />
                    Monthly Income Profit
                  </div>

                  <h6 className="investMonthProfit mb-2">
                    UPTO <span>6%</span>
                  </h6>
                  <h6 className="investMonthDescription mb-3">
                    Members can earn up to{' '}
                    <strong style={{ color: '#16a34a', fontWeight: 800 }}>6%</strong>{' '}
                    monthly profit on their{' '}
                    <strong style={{ color: '#16a34a', fontWeight: 800 }}>BOT 3</strong>{' '}
                    <br className="d-none d-lg-block" />
                    <strong style={{ color: '#16a34a', fontWeight: 800 }}>investment</strong>,
                    along with
                    <strong style={{ color: '#16a34a', fontWeight: 800 }}> 5% </strong>


                    direct{' '}
                    <strong style={{ color: '#16a34a', fontWeight: 800 }}>income</strong>. Both
                    the investment amount and earned income can be withdrawn at any time with
                    minimal Charges.
                  </h6>

                  <div className="investMonthDetails row g-3">
                    <div className="col-12 col-sm-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="investMonthDetailIcon">
                          <CalendarDays size={21} />
                        </div>
                        <div>
                          <small>Cycle</small>
                          <strong>Monthly</strong>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-sm-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="investMonthDetailIcon">
                          <Coins size={23} />
                        </div>
                        <div>
                          <small>Minimum Investment</small>
                          <strong className="investMonthMinimum">$1000</strong>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-sm-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="investMonthDetailIcon">
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <small>Direct Income</small>
                          <strong>5%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Investment form */}
          <div className="investMonthForm">
            <label
              htmlFor="investMonthAmount"
              className="investMonthAmountLabel"
            >
              AMOUNT <span>*</span>
            </label>

            <div className="amount-input-wrapper mb-3">
              <span className="currency-sign">$</span>

              <input
                id="investMonthAmount"
                className="amount-input-field"
                style={styles.amountInput}
                type="number"
                min="1000"
                step="any"
                placeholder="Enter Amount"
                value={bot3Amount}
                onChange={(e) => setBot3Amount(e.target.value)}
                disabled={loadingBot3}
              />
            </div>

            <button
              type="button"
              className="invest-now-btn"
              style={styles.button}
              onClick={() => investInBot3(bot3Amount)}
              disabled={loadingBot3}
            >
              <TrendingUp size={20} />

              <span>
                {loadingBot3 ? 'PROCESSING...' : 'INVEST NOW'}
              </span>

              <span className="investMonthArrow">
                <ArrowRight size={20} />
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Component-specific styling */}
      <style>{`
        .investMonthPage {
          width: 100%;
          background: #f5f8fd;
          color: #172b4d;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        .investMonthCard {
          overflow: hidden;
        }

        .investMonthTitle {
          color: #14294b;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .investMonthSubtitle {
          color: #77869f;
          font-size: 12px;
        }

        .investMonthTrust {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #627693;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.5;
        }

        .investMonthTrust svg {
          color: #176cf5;
          flex-shrink: 0;
        }

        .investMonthTrust + .investMonthTrust {
          border-left: 1px solid #e0e9f7;
          padding-left: 13px;
        }

        .investMonthRobot {
          height: 100%;
          min-height: 245px;
          position: relative;
          overflow: hidden;
          border: 1px solid #deebfc;
          border-radius: 16px;
          background: #edf6ff;
        }

        .investMonthRobotImg {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 245px;
          max-height: 260px;
          object-fit: cover;
          object-position: center;
        }

        .investMonthRobotCaption {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 10px;
          background: rgba(255,255,255,.91);
          backdrop-filter: blur(8px);
        }

        .investMonthCaptionIcon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf3ff;
          color: #176cf5;
        }

        .investMonthRobotCaption strong,
        .investMonthRobotCaption div > span {
          display: block;
          font-size: 10px;
          line-height: 1.6;
        }

        .investMonthRobotCaption strong {
          color: #24466f;
          font-weight: 700;
        }

        .investMonthRobotCaption div > span {
          color: #647e9e;
        }

        .investMonthPanelContent {
          position: relative;
          z-index: 2;
        }

        .investMonthProfit {
          color: #15294b;
          font-size: 30px;
          font-weight: 850;
          letter-spacing: -1.8px;
          line-height: 1.12;
        }

        .investMonthProfit span {
          color: #176af5;
        }

        .investMonthDescription {
          max-width: 430px;
          color: #74839c;
          font-size: 13px;
          line-height: 1.7;
        }

        .investMonthGrowthArt {
          position: absolute;
          width: 36%;
          height: 54%;
          right: 3%;
          top: 3%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #268aff;
          opacity: .35;
          pointer-events: none;
        }

        .investMonthGrowthArt > svg {
          position: relative;
          z-index: 1;
          width: 42%;
          height: auto;
        }

        .investMonthBars {
          position: absolute;
          inset: auto 5% 0;
          height: 70%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 7px;
        }

        .investMonthBars span {
          display: block;
          width: 16%;
          border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, #70c8ff, #477df8);
        }

        .investMonthBars span:nth-child(1) { height: 25%; }
        .investMonthBars span:nth-child(2) { height: 42%; }
        .investMonthBars span:nth-child(3) { height: 62%; }
        .investMonthBars span:nth-child(4) { height: 90%; }

        .investMonthCoins {
          position: absolute;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: flex-end;
          color: #dba936;
        }

        .investMonthCoins svg {
          margin-left: -10px;
        }

        .investMonthDetails {
          border-top: 1px solid #e8eef8;
          padding-top: 14px;
          margin-top: 4px;
        }

        .investMonthDetails small {
          display: block;
          color: #8491a8;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .investMonthDetails strong {
          display: block;
          color: #1c3152;
          font-size: 13px;
          font-weight: 750;
        }

        .investMonthDetails .investMonthMinimum {
          color: #176af5;
        }

        .investMonthDetailIcon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf3ff;
          color: #176af5;
        }

        .investMonthAmountLabel {
          display: block;
          margin-bottom: 8px;
          color: #294363;
          font-size: 12px;
          font-weight: 750;
        }

        .investMonthAmountLabel span {
          color: #ef4444;
        }

        .investMonthDollar {
          position: absolute;
          top: 50%;
          left: 15px;
          z-index: 2;
          transform: translateY(-50%);
          color: #617794;
          font-size: 16px;
          pointer-events: none;
        }

 
        .investMonthButton:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(37,99,235,.22);
        }

        .investMonthArrow {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.22);
        }

        @media (min-width: 1200px) {
          .investMonthDetails > div:not(:first-child) {
            border-left: 1px solid #e6edf8;
            padding-left: 20px;
          }
        }

        @media (max-width: 767px) {
          .investMonthCard {
            padding: 14px !important;
            border-radius: 16px !important;
          }

          .investMonthTitle {
            font-size: 19px;
          }

          .investMonthSubtitle {
            font-size: 11px;
          }

          .investMonthTrust {
            font-size: 10px;
          }

          .investMonthTrust + .investMonthTrust {
            padding-left: 8px;
          }



          .investMonthProfit {
            font-size: 20px;
            letter-spacing: -1.2px;
          }

          .investMonthDescription {
            font-size: 12px;
          }

          .investMonthGrowthArt {
            width: 35%;
            height: 38%;
            opacity: .17;
          }

          .investMonthDetails {
            padding-top: 11px;
          }

          .investMonthDetails > div {
            padding-top: 3px;
            padding-bottom: 3px;
          }

          .investMonthDetails small {
            font-size: 10px;
          }

          .investMonthDetails strong {
            font-size: 12px;
          }

          .investMonthDetailIcon {
            width: 33px;
            height: 33px;
            min-width: 33px;
          }

          .investMonthButton {
            height: 46px !important;
            font-size: 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .investMonthButton {
            transition: none;
          }
        }
      `}</style>

      <StakeCrad/>
    </div>
  );
};

export default Investmonth;