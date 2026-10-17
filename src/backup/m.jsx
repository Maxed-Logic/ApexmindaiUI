import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { FaCalendarAlt, FaCoins, FaSyncAlt } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Toast from '../../Componenets/ui/Toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

import { FreeMode, Navigation } from 'swiper/modules';
import { useUser } from '../../context/UserContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const Stakecard = () => {
  const [stakes, setStakes] = useState([]);
  const [error, setError] = useState(null);
  const [payoutData, setPayoutData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payMode] = useState('usdt');
  const [loadingRid, setLoadingRid] = useState(null);

  // ✅ Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const regno = sessionStorage.getItem('Regno');

  const { userData } = useUser();
  const walletAddress = userData?.walletid || '';

  // ✅ Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchStakes = async () => {
      try {
        setError(null);

        const res = await apiClient.get(
          '/Dashboard/RechargeTransactionHistory',
          {
            params: {
              regno: Number(regno),
              type: 'stake',
              pageIndex: 1,
              pageSize: 100,
            },
          }
        );

        if (res.data?.result === 'true') {
          const history = res.data.response?.tradingHistory || [];
          const stakeRecords = history.filter(
            (item) => item.type?.toLowerCase() === 'stake'
          );
          setStakes(stakeRecords);
        } else {
          setStakes([]);
          setError(res.data?.message || 'Failed to fetch stake data');
        }
      } catch (err) {
        console.error('Stake API Error:', err.response || err);
        setError(
          err.response?.data?.message ||
            'An error occurred while fetching data'
        );
        setStakes([]);
      }
    };

    if (regno) fetchStakes();
  }, [regno]);

  const handlePayout = async (rid) => {
    try {
      setLoadingRid(rid);

      const res = await apiClient.get(
        `/IncomePayout/capital-withdrawal-report/${rid}`
      );

      console.log('Payout API Response:', res.data);

      if (res.data?.result === 'true') {
        const data = res.data.response?.data?.[0];

        if (!data) {
          showToast('No payout data found for this stake.', 'error');
          return;
        }

        setPayoutData(data);
        setShowModal(true);
      } else {
        showToast(
          res.data?.message || 'Failed to fetch payout details',
          'error'
        );
      }
    } catch (err) {
      console.error('Payout API Error:', err.response || err);
      showToast(
        err.response?.data?.message || 'Error fetching payout details',
        'error'
      );
    } finally {
      setLoadingRid(null);
    }
  };

  const submitWithdrawal = async () => {
    try {
      setLoadingRid(payoutData.Rid);

      const payload = {
        regno: Number(payoutData.Regno),
        amount: Number(payoutData.payout),
        wallet_address: walletAddress,
        pay_mode: payMode,
        rid: Number(payoutData.Rid),
      };

      console.log('Withdrawal Payload:', payload);

      const res = await apiClient.post(
        '/IncomePayout/capital-payout-withdrawal',
        payload
      );

      console.log('Withdrawal Response:', res.data);

      if (res.data?.result === 'true') {
        showToast(
          res.data?.message || 'Withdrawal request submitted successfully',
          'success'
        );
        setShowModal(false);
        setPayoutData(null);
      } else {
        showToast(res.data?.message || 'Withdrawal failed', 'error');
      }
    } catch (err) {
      console.error('Withdrawal API Error:', err.response || err);
      showToast(
        err.response?.data?.message || 'Error submitting withdrawal',
        'error'
      );
    } finally {
      setLoadingRid(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <>
        <style>{`
          .stake-error {
            margin: 16px;
            padding: 14px 16px;
            border: 1px solid #fecaca;
            border-radius: 12px;
            background: #fff1f2;
            color: #b91c1c;
            font-size: 14px;
          }
        `}</style>
        <div className="stake-error">{error}</div>
      </>
    );
  }

  if (stakes.length === 0) {
    return (
      <>
        <style>{`
          .stake-empty {
            text-align: center;
            padding: 48px 16px;
            border: 1px dashed #3f2ab3;
            border-radius: 14px;
            background: #fffdf7;
          }

          .stake-empty p {
            color: #8b95a5;
            margin: 0;
            font-size: 14px;
          }
        `}</style>

        <div className="stake-empty">
          <p>No stake records found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        /* ---------- Main Container ---------- */
        .stake-container {
          position: relative;
          padding: 4px 2px 12px;
        }

        .stake-swiper {
          padding: 5px 3px 18px;
        }

        .stake-swiper .swiper-slide {
          height: auto;
          display: flex;
        }

        .stake-swiper .swiper-slide > .stake-card {
          width: 100%;
        }

        /* ---------- Navigation ---------- */
        .stake-nav-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .stake-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #443beca5;
          background: #fff;
          color: #2700c577;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 19px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(239, 176, 27, 0.12);
        }

        .stake-nav-btn:hover {
          background: #1b26ef;
          color: #fff;
          transform: translateY(-2px);
        }

        .stake-nav-btn:active {
          transform: scale(0.95);
        }

        /* ---------- Card ---------- */
        .stake-card {
          position: relative;
          overflow: hidden;
          height: 100%;
          background: #fff;
          border: 1px solid #c6c2f3 !important;
          border-radius: 16px !important;
          box-shadow: 0 5px 20px rgba(30, 41, 59, 0.06) !important;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .stake-card-inner {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px 16px !important;
        }

        /* ---------- Chart ---------- */
        .stake-chart-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .stake-chart-box {
          position: relative;
          width: 122px;
          height: 122px;
          flex-shrink: 0;
        }

        .stake-chart-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
        }

        .stake-chart-center h6 {
          margin: 0;
          padding: 0;
          line-height: 1.3;
          font-weight: 800;
          color: green;
          font-size: 15px;
          overflow-wrap: anywhere;
        }

        .stake-chart-center p {
          margin: 3px 0 0;
          padding: 0;
          line-height: 1.1;
          color: #8b95a5;
          font-size: 11px;
          font-weight: 600;
        }

        /* ---------- Right Side Details ---------- */
        .stake-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
        }

        .stake-details > .d-flex {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px !important;
        }

        .stake-row {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .stake-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 11px !important;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          font-size: 15px;
        }

        .stake-icon-coins {
          background: #fff4d5 !important;
          color: #c58a00b1 !important;
          font-size: 16px;
        }

        .stake-icon-earn {
          background: #e5f8ed !important;
          color: #20a464 !important;
        }

        .stake-icon-date {
          background: #e8f3ff !important;
          color: #3686d9 !important;
        }

        .stake-icon-cycle {
          background: #fff4d5 !important;
          color: #c58b00 !important;
        }

        .stake-label {
          margin: 0 0 4px;
          color: #8b95a5;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.35;
        }

        .stake-value-lg {
          margin: 0;
          font-weight: 800;
          color: #b78300;
          font-size: 16px;
          line-height: 1.3;
          white-space: nowrap;
        }

        .stake-value {
          margin: 0;
          font-weight: 750;
          font-size: 14px;
          color: #20a464;
          line-height: 1.3;
          white-space: nowrap;
        }

        .stake-value-sm {
          margin: 0;
          font-weight: 700;
          font-size: 13px;
          color: #263449;
          line-height: 1.4;
          white-space: nowrap;
        }

        .stake-sub {
          color: #8b95a5;
          margin-left: 4px;
          font-size: 11px;
          font-weight: 400;
        }

        /* ---------- Payout Modal ---------- */
        .payout-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }

        .payout-modal {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .payout-modal-title {
          margin: 0 0 16px;
          font-weight: 800;
          color: #263449;
          font-size: 18px;
        }

        .payout-modal-info {
          background: #f8fafc;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .payout-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 5px 0;
          color: #64748b;
        }

        .payout-info-row strong {
          color: #263449;
          font-weight: 700;
        }

        .payout-modal-field {
          margin-bottom: 14px;
        }

        .payout-modal-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
        }

        .payout-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .payout-modal-actions .btn {
          flex: 1;
          min-height: 42px;
          font-weight: 600;
        }

        /* ---------- Tablet ---------- */
        @media (max-width: 1024px) {
          .stake-card-inner {
            gap: 12px;
            padding: 18px 13px !important;
          }

          .stake-chart-box {
            width: 108px;
            height: 108px;
          }

          .stake-details {
            gap: 14px;
          }

          .stake-details > .d-flex {
            gap: 10px !important;
          }

          .stake-row {
            gap: 7px;
          }

          .stake-icon {
            width: 31px;
            height: 31px;
            font-size: 13px;
          }
        }

        /* ---------- Mobile ---------- */
        @media (max-width: 640px) {
          .stake-container {
            margin-left: 8px !important;
            margin-right: 8px !important;
          }

          .stake-swiper {
            padding: 4px 2px 14px;
          }

          .stake-card-inner {
            align-items: center !important;
            gap: 14px;
            padding: 19px 14px !important;
          }

          .stake-chart-box {
            width: 105px;
            height: 105px;
          }

          .stake-chart-center h6 {
            font-size: 13px;
          }

          .stake-chart-center p {
            font-size: 10px;
          }

          .stake-details {
            gap: 15px;
          }

          .stake-details > .d-flex {
            gap: 12px 8px !important;
          }

          .stake-row {
            gap: 7px;
          }

          .stake-icon {
            width: 29px;
            height: 29px;
            border-radius: 9px !important;
            font-size: 12px;
          }

          .stake-label {
            font-size: 10px;
          }

          .stake-value-lg {
            font-size: 14px;
          }

          .stake-value,
          .stake-value-sm {
            font-size: 12px;
          }

          .stake-details > .btn {
            min-height: 39px;
          }
        }

        /* ---------- Small Mobile ---------- */
        @media (max-width: 380px) {
          .stake-card-inner {
            flex-direction: column;
            gap: 18px;
            padding: 20px 14px !important;
          }

          .stake-chart-box {
            width: 125px;
            height: 125px;
          }

          .stake-chart-center h6 {
            font-size: 15px;
          }

          .stake-details {
            width: 100%;
            gap: 15px;
          }

          .stake-details > .d-flex {
            gap: 14px 8px !important;
          }

          .stake-icon {
            width: 32px;
            height: 32px;
          }

          .stake-label {
            font-size: 11px;
          }

          .stake-value-lg {
            font-size: 15px;
          }

          .stake-value,
          .stake-value-sm {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="stake-container mx-2">
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          loop={false}
          freeMode={true}
          navigation={{
            prevEl: '.stake-prev',
            nextEl: '.stake-next',
          }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 8 },
            640: { slidesPerView: 2, spaceBetween: 8 },
            1024: { slidesPerView: 3, spaceBetween: 8 },
          }}
          modules={[FreeMode, Navigation]}
          className="mySwiper stake-swiper"
        >
          {stakes.map((stake) => {
            const totalIncome = Number(stake.BinaryBuffer) || 0;
            const paidAmount = Number(stake.AmtPaid) || 0;
            const pendingAmount = totalIncome - paidAmount;

            const chartData = {
              labels: ['Paid', 'Pending'],
              datasets: [
                {
                  data: [paidAmount, pendingAmount > 0 ? pendingAmount : 0],
                  backgroundColor: ['#48bb78', '#e2e8f0'],
                  borderWidth: 0,
                  hoverOffset: 3,
                },
              ],
            };

            const chartOptions = {
              cutout: '75%',
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              maintainAspectRatio: false,
              responsive: true,
            };

            return (
              <SwiperSlide key={stake.Rid}>
                <div className="stake-card card shadow-sm mt-3">
                  <div className="stake-card-inner card-body d-flex align-items-center">
                    {/* Donut Chart */}
                    <div className="stake-chart-wrap">
                      <div className="stake-chart-box">
                        <Doughnut data={chartData} options={chartOptions} />
                        <div className="stake-chart-center">
                          <h6>${paidAmount.toFixed(2)}</h6>
                          <p>Profit</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Details */}
                    <div className="stake-details">
                      <div className="d-flex gap-2">
                        <div className="stake-row d-flex align-items-center">
                          <div className="stake-icon stake-icon-coins bg-primary-subtle rounded-circle">
                            <FaCoins />
                          </div>
                          <div>
                            <p className="stake-label">Invest Amt</p>
                            <h5 className="stake-value-lg">
                              ${stake.Rkprice}
                            </h5>
                          </div>
                        </div>

                        <div className="stake-row d-flex align-items-center">
                          <div className="stake-icon stake-icon-earn bg-success-subtle rounded-circle">
                            $
                          </div>
                          <div>
                            <p className="stake-label">Monthly ROI</p>
                            <h6 className="stake-value">{stake.slabfine}%</h6>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <div className="stake-row d-flex align-items-center">
                          <div className="stake-icon stake-icon-date bg-info-subtle rounded-circle">
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <p className="stake-label">Invested On</p>
                            <h6 className="stake-value-sm">
                              {formatDate(stake.Rdate)}
                            </h6>
                          </div>
                        </div>

                        <div className="stake-row d-flex align-items-center">
                          <div className="stake-icon stake-icon-cycle bg-warning-subtle rounded-circle">
                            <FaSyncAlt />
                          </div>
                          <div>
                            <p className="stake-label">Invest Day</p>
                            <h6 className="stake-value-sm">
                              {stake.days || '0'}
                            </h6>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handlePayout(stake.Rid)}
                        disabled={loadingRid === stake.Rid}
                      >
                        {loadingRid === stake.Rid ? 'Loading...' : 'Refund'}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Previous / Next Buttons */}
        <div className="stake-nav-wrap">
          <button
            type="button"
            className="stake-nav-btn stake-prev"
            aria-label="Previous stake"
          >
            <i className="ti ti-chevron-left"></i>
          </button>

          <button
            type="button"
            className="stake-nav-btn stake-next"
            aria-label="Next stake"
          >
            <i className="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Payout Modal */}
      {showModal && payoutData && (
        <div className="payout-modal-overlay">
          <div className="payout-modal">
            <h5 className="payout-modal-title">Withdraw Payout</h5>

            <div className="payout-modal-info">
              <div className="payout-info-row">
                <span>Payout Amount</span>
                <strong>${payoutData.Rkprice}</strong>
              </div>
              <div className="payout-info-row">
                <span>Payout Charge</span>
                <strong>{payoutData.PayoutCharge}%</strong>
              </div>
              <div className="payout-info-row">
                <span>Net Amount</span>
                <strong>
                  $
                  {Number(payoutData.Rkprice) -
                    Number(payoutData.PayoutCharge)}
                </strong>
              </div>
            </div>

            <div className="payout-modal-field">
              <label>Wallet Address</label>
              <input
                style={{ color: 'green' }}
                type="text"
                className="form-control"
                placeholder="Enter wallet address"
                value={walletAddress}
                readOnly
              />
            </div>

            {payoutData.PayoutCharge > 0 && (
              <div style={{ color: '#991b1b', fontSize: '12.5px' }}>
                <strong style={{ color: '#7f1d1d' }}>Note:</strong> Since you
                are withdrawing your funds before completing 6 months, a{' '}
                <strong style={{ color: '#7f1d1d' }}>
                  {payoutData.PayoutCharge}%
                </strong>{' '}
                withdrawal charge will apply.
              </div>
            )}

            <div className="payout-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setPayoutData(null);
                }}
                disabled={loadingRid !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitWithdrawal}
                disabled={loadingRid !== null}
              >
                {loadingRid !== null ? 'Submitting...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast render - sabse neeche */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: '', type: 'success' })
          }
        />
      )}
    </>
  );
};

export default Stakecard;