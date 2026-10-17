import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { FaCalendarAlt, FaCoins, FaSyncAlt } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast'; // ✅ Direct react-hot-toast import kiya
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
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

  const regno = sessionStorage.getItem('Regno');
  const { userData } = useUser();
  const walletAddress = userData?.walletid || '';

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
          toast.error('No payout data found for this stake.'); // ✅ TOAST SUCCESS/ERROR
          return;
        }

        setPayoutData(data);
        setShowModal(true);
      } else {
        toast.error(res.data?.message || 'Failed to fetch payout details');
      }
    } catch (err) {
      console.error('Payout API Error:', err.response || err);
      toast.error(err.response?.data?.message || 'Error fetching payout details');
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
        // ✅ Success Toast
        toast.success(
          res.data?.message || 'Withdrawal request submitted successfully'
        );
        setShowModal(false);
        setPayoutData(null);
      } else {
        // ✅ Error Toast
        toast.error(res.data?.message || 'Withdrawal failed');
      }
    } catch (err) {
      console.error('Withdrawal API Error:', err.response || err);
      toast.error(err.response?.data?.message || 'Error submitting withdrawal');
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

        <div className="stake-empty mt-4 mx-3 ">
          <p>No stake records found.</p>
        </div>
      </>
    );
  }

  return (
    <>
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
<<<<<<< HEAD
            const paidAmount = Number(stake.perDay) || 0;     
=======
            const paidAmount = Number(stake.AmtPaid) || 0;
>>>>>>> origin/main
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
                      <Link to="/dashboard/Bot3PayoutReport">
                        <button
                          type="button"
                          style={{
                            width: "80px",
                            padding: "6px 10px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            marginTop: "-20px",
                            position: "absolute",
                            right: "15px",
                            top: "25px",
                            zIndex: 10,
                            cursor: "pointer",
                          }}
                        >
                          Report
                        </button>
                      </Link>
                      
                      <div className="d-flex gap-2 mt-4">
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
    </>
  );
};

export default Stakecard;