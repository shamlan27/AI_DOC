<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Payment;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PaymentStatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $today = now()->toDateString();

        $todayCompleted = Payment::query()
            ->whereDate('created_at', $today)
            ->where('status', 'completed');

        $totalToday = (float) (clone $todayCompleted)->sum('amount');
        $onlineToday = (float) (clone $todayCompleted)->where('payment_method', 'online')->sum('amount');
        $counterToday = (float) (clone $todayCompleted)->where('payment_method', 'counter')->sum('amount');
        $pendingCounterCount = Payment::query()
            ->where('payment_method', 'counter')
            ->where('status', 'pending')
            ->count();

        return [
            Stat::make('Today Total Payments', 'LKR ' . number_format($totalToday, 2))
                ->description('Completed payments today')
                ->color('success'),
            Stat::make('Today Online Payments', 'LKR ' . number_format($onlineToday, 2))
                ->description('Paid via Visa / Mastercard (mock)')
                ->color('primary'),
            Stat::make('Today Counter Payments', 'LKR ' . number_format($counterToday, 2))
                ->description('Completed at hospital counter')
                ->color('info'),
            Stat::make('Pending Counter Payments', (string) $pendingCounterCount)
                ->description('Need admin confirmation')
                ->color('warning'),
        ];
    }
}
